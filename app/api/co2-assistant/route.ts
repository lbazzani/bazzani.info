import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// Function to load CO2 data
function loadCO2Data(view: string, params?: Record<string, any>) {
  const dataDir = path.join(process.cwd(), 'public', 'data', 'co2');

  if (view === 'global') {
    const globalPath = path.join(dataDir, 'global-summary.json');
    return JSON.parse(fs.readFileSync(globalPath, 'utf-8'));
  }

  if (view === 'top') {
    const topPath = path.join(dataDir, 'top-emitters.json');
    return JSON.parse(fs.readFileSync(topPath, 'utf-8'));
  }

  if (view === 'country' && params?.country) {
    const countryPath = path.join(dataDir, `country-${params.country}.json`);
    if (fs.existsSync(countryPath)) {
      return JSON.parse(fs.readFileSync(countryPath, 'utf-8'));
    }
    return null;
  }

  return null;
}

// Available function tools for the AI
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_global_emissions',
      description: 'Get global CO2 emissions data aggregated by year. Returns total global emissions, per capita, and cumulative values from 1950 to 2023.',
      parameters: {
        type: 'object',
        properties: {
          start_year: {
            type: 'number',
            description: 'Starting year for the data range (minimum 1950)',
          },
          end_year: {
            type: 'number',
            description: 'Ending year for the data range (maximum 2023)',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_top_emitters',
      description: 'Get top CO2 emitting countries by year. Returns the top emitters with their emission values, per capita emissions, and cumulative totals.',
      parameters: {
        type: 'object',
        properties: {
          year: {
            type: 'number',
            description: 'Specific year to get top emitters for (1950-2023)',
          },
          limit: {
            type: 'number',
            description: 'Number of top countries to return (default 10)',
          },
        },
        required: ['year'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_country_data',
      description: 'Get detailed CO2 emissions data for a specific country across all years (1950-2023). Returns yearly emissions, per capita, cumulative totals, population, and GDP data. ONLY works for these countries: USA, CHN, IND, RUS, JPN, DEU, GBR, FRA, ITA, ESP, CAN, AUS, BRA, KOR, MEX.',
      parameters: {
        type: 'object',
        properties: {
          country_code: {
            type: 'string',
            description: 'ISO 3-letter country code. Available codes: USA, CHN, IND, RUS, JPN, DEU, GBR, FRA, ITA, ESP, CAN, AUS, BRA, KOR, MEX',
          },
        },
        required: ['country_code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_countries',
      description: 'Compare CO2 emissions between multiple countries over time. Returns comparative data for specified metrics.',
      parameters: {
        type: 'object',
        properties: {
          country_codes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of ISO 3-letter country codes to compare',
          },
          metric: {
            type: 'string',
            enum: ['co2', 'co2_per_capita', 'cumulative_co2'],
            description: 'Metric to compare: total CO2, per capita, or cumulative',
          },
          start_year: {
            type: 'number',
            description: 'Starting year for comparison',
          },
          end_year: {
            type: 'number',
            description: 'Ending year for comparison',
          },
        },
        required: ['country_codes', 'metric'],
      },
    },
  },
];

// Execute function calls
function executeFunction(functionName: string, args: any) {
  try {
    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

    switch (functionName) {
      case 'get_global_emissions': {
        const data = loadCO2Data('global');
        let filtered = data;

        if (parsedArgs.start_year || parsedArgs.end_year) {
          filtered = data.filter((d: any) => {
            const year = d.year;
            const afterStart = !parsedArgs.start_year || year >= parsedArgs.start_year;
            const beforeEnd = !parsedArgs.end_year || year <= parsedArgs.end_year;
            return afterStart && beforeEnd;
          });
        }

        return {
          success: true,
          data: filtered,
          metadata: {
            count: filtered.length,
            start_year: filtered[0]?.year,
            end_year: filtered[filtered.length - 1]?.year,
          },
        };
      }

      case 'get_top_emitters': {
        const { year, limit = 10 } = parsedArgs;
        const allData = loadCO2Data('top');
        const yearData = allData[year];

        if (!yearData) {
          return { success: false, error: `No data available for year ${year}` };
        }

        const topCountries = yearData.slice(0, limit);

        return {
          success: true,
          data: topCountries,
          metadata: {
            year,
            count: topCountries.length,
          },
        };
      }

      case 'get_country_data': {
        const { country_code } = parsedArgs;
        const data = loadCO2Data('country', { country: country_code });

        if (!data) {
          return { success: false, error: `No data available for country ${country_code}` };
        }

        return {
          success: true,
          data: data.data,
          metadata: {
            country: data.country,
            country_code,
            years: data.data.length,
          },
        };
      }

      case 'compare_countries': {
        const { country_codes, metric, start_year, end_year } = parsedArgs;
        const comparison: any = {
          metric,
          countries: {},
        };

        country_codes.forEach((code: string) => {
          const countryData = loadCO2Data('country', { country: code });
          if (countryData) {
            let filtered = countryData.data;

            if (start_year || end_year) {
              filtered = filtered.filter((d: any) => {
                const year = d.year;
                const afterStart = !start_year || year >= start_year;
                const beforeEnd = !end_year || year <= end_year;
                return afterStart && beforeEnd;
              });
            }

            comparison.countries[code] = {
              name: countryData.country,
              data: filtered.map((d: any) => ({
                year: d.year,
                value: d[metric],
              })),
            };
          }
        });

        return {
          success: true,
          data: comparison,
          metadata: {
            countries_compared: Object.keys(comparison.countries).length,
            metric,
          },
        };
      }

      default:
        return { success: false, error: `Unknown function: ${functionName}` };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages)) {
          controller.enqueue(encoder.encode('data: {"error": "Messages array is required"}\n\n'));
          controller.close();
          return;
        }

        const openaiApiKey = process.env.OPENAI_API_KEY;
        const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        if (!openaiApiKey) {
          controller.enqueue(encoder.encode('data: {"error": "OpenAI API key not configured"}\n\n'));
          controller.close();
          return;
        }

        // System message with context
        const systemMessage = {
          role: 'system',
          content: `You are a CO2 Emissions Data Assistant. You help users analyze and understand global CO2 emissions data from 1950 to 2023.

CRITICAL RULES:
- ONLY use data retrieved from the functions. NEVER make up, estimate, or guess data.
- If a function call fails or returns an error, explain that the data is not available.
- If asked about a country not in the database, clearly state which countries ARE available.
- NEVER provide estimated ranges or "expected" values - only use actual data from function results.

Available data:
- Global emissions by year (1950-2023)
- Top emitting countries by year (1950-2023)
- Detailed country-level data for: USA, CHN, IND, RUS, JPN, DEU, GBR, FRA, ITA, ESP, CAN, AUS, BRA, KOR, MEX
- Multiple metrics: total CO2 (Mt), per capita (t/person), cumulative CO2 (Mt), population, GDP

When answering questions:
1. ALWAYS call the appropriate functions to retrieve data
2. ONLY present data that was successfully retrieved from functions
3. If function returns an error, inform the user which data is available
4. Provide clear, concise explanations of trends based on ACTUAL data
5. When data benefits from visualization, format your response with chart markers (see below)
6. Use units consistently: Mt for total emissions, t/person for per capita
7. Highlight significant trends, changes, or comparisons FROM THE DATA
8. Be educational - explain what the data means in context

For visualizations, format your response like this:
CHART:TYPE:{line|bar|area}
CHART:DATA:{json data}
CHART:TITLE:{chart title}
Then continue with your text explanation.

Remember: Be honest about data availability. It's better to say "I don't have data for that country" than to provide estimates.`,
        };

        const allMessages = [systemMessage, ...messages];

        // First API call with function calling
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: openaiModel,
            messages: allMessages,
            tools,
            tool_choice: 'auto',
            stream: false,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('OpenAI API error:', error);
          controller.enqueue(encoder.encode(`data: {"error": "Failed to get AI response"}\n\n`));
          controller.close();
          return;
        }

        let data = await response.json();
        let assistantMessage = data.choices[0]?.message;

        // Handle function calls
        while (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
          // Add assistant message with tool calls to conversation
          allMessages.push(assistantMessage);

          // Execute each function call
          for (const toolCall of assistantMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = toolCall.function.arguments;

            // Send function call info to client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'function_call',
              function: functionName,
              arguments: JSON.parse(functionArgs),
            })}\n\n`));

            const functionResult = executeFunction(functionName, functionArgs);

            // Add function result to conversation
            allMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(functionResult),
            });
          }

          // Call API again with function results
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: JSON.stringify({
              model: openaiModel,
              messages: allMessages,
              tools,
              tool_choice: 'auto',
              stream: false,
            }),
          });

          data = await response.json();
          assistantMessage = data.choices[0]?.message;
        }

        // Send final response
        if (assistantMessage?.content) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'content',
            content: assistantMessage.content,
          })}\n\n`));
        }

        controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
        controller.close();

      } catch (error) {
        console.error('CO2 Assistant error:', error);
        controller.enqueue(encoder.encode(`data: {"error": "${String(error)}"}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
