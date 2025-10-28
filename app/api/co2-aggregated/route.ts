import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const view = searchParams.get('view') || 'global'; // global, top, regional, country, countries-list
  const country = searchParams.get('country'); // for country view

  try {
    const dataDir = path.join(process.cwd(), 'public', 'data', 'co2');
    let filePath: string;

    switch (view) {
      case 'global':
        filePath = path.join(dataDir, 'global-summary.json');
        break;
      case 'top':
        filePath = path.join(dataDir, 'top-emitters.json');
        break;
      case 'regional':
        filePath = path.join(dataDir, 'regional-summary.json');
        break;
      case 'countries-list':
        filePath = path.join(dataDir, 'countries-list.json');
        break;
      case 'country':
        if (!country) {
          return NextResponse.json({ error: 'Country code required' }, { status: 400 });
        }
        filePath = path.join(dataDir, `country-${country}.json`);
        if (!fs.existsSync(filePath)) {
          return NextResponse.json({ error: 'Country data not found' }, { status: 404 });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    return NextResponse.json({
      success: true,
      view,
      data,
    });
  } catch (error) {
    console.error('Error loading CO2 data:', error);
    return NextResponse.json(
      { error: 'Failed to load data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
