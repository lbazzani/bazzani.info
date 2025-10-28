import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

export const dynamic = 'force-dynamic';

interface CO2Record {
  country: string;
  year: number;
  iso_code: string;
  population?: number;
  gdp?: number;
  co2?: number;
  co2_per_capita?: number;
  coal_co2?: number;
  gas_co2?: number;
  oil_co2?: number;
  cement_co2?: number;
  cumulative_co2?: number;
  temperature_change_from_co2?: number;
  ghg_per_capita?: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const countries = searchParams.get('countries')?.split(',') || [];
  const yearFrom = parseInt(searchParams.get('yearFrom') || '1900');
  const yearTo = parseInt(searchParams.get('yearTo') || '2023');
  const limit = parseInt(searchParams.get('limit') || '10000');

  const encoder = new TextEncoder();
  const csvPath = path.join(process.cwd(), 'demo_data', 'owid-co2-data.csv');

  const stream = new ReadableStream({
    async start(controller) {
      let count = 0;
      let processedRows = 0;
      const records: CO2Record[] = [];

      try {
        // Send initial status
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'status', message: 'Inizio lettura file CSV...', progress: 0 })}\n\n`
          )
        );

        const fileStream = fs.createReadStream(csvPath);
        const parser = fileStream.pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          })
        );

        for await (const row of parser) {
          processedRows++;

          // Send progress updates every 1000 rows
          if (processedRows % 1000 === 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'status',
                  message: `Elaborazione dati... ${processedRows} righe processate`,
                  progress: Math.min(90, (processedRows / 50000) * 100),
                })}\n\n`
              )
            );
          }

          const year = parseInt(row.year);

          // Apply filters
          if (year < yearFrom || year > yearTo) continue;
          if (countries.length > 0 && !countries.includes(row.iso_code)) continue;

          // Skip rows with no meaningful data
          if (!row.co2 || row.co2 === '') continue;

          records.push({
            country: row.country,
            year,
            iso_code: row.iso_code,
            population: row.population ? parseFloat(row.population) : undefined,
            gdp: row.gdp ? parseFloat(row.gdp) : undefined,
            co2: row.co2 ? parseFloat(row.co2) : undefined,
            co2_per_capita: row.co2_per_capita ? parseFloat(row.co2_per_capita) : undefined,
            coal_co2: row.coal_co2 ? parseFloat(row.coal_co2) : undefined,
            gas_co2: row.gas_co2 ? parseFloat(row.gas_co2) : undefined,
            oil_co2: row.oil_co2 ? parseFloat(row.oil_co2) : undefined,
            cement_co2: row.cement_co2 ? parseFloat(row.cement_co2) : undefined,
            cumulative_co2: row.cumulative_co2 ? parseFloat(row.cumulative_co2) : undefined,
            temperature_change_from_co2: row.temperature_change_from_co2
              ? parseFloat(row.temperature_change_from_co2)
              : undefined,
            ghg_per_capita: row.ghg_per_capita ? parseFloat(row.ghg_per_capita) : undefined,
          });

          count++;
          if (count >= limit) break;
        }

        // Send completion status
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'status',
              message: `Completato! ${count} record caricati`,
              progress: 100,
            })}\n\n`
          )
        );

        // Send the actual data
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'data',
              records,
              metadata: {
                totalRecords: count,
                processedRows,
                yearFrom,
                yearTo,
                countries: countries.length > 0 ? countries : 'all',
              },
            })}\n\n`
          )
        );

        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: error instanceof Error ? error.message : 'Errore durante il caricamento',
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
