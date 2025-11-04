import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sensors, junctionBoxes, unitsX, unitsY, unitsZ } = body;

    // Calculate current metrics
    const totalSensors = sensors.length;
    const totalJunctionBoxes = junctionBoxes.length;
    const totalVolume = unitsX * unitsY * unitsZ;

    // Group sensors by type
    const sensorsByType: { [key: number]: any[] } = {};
    sensors.forEach((sensor: any) => {
      if (!sensorsByType[sensor.type]) {
        sensorsByType[sensor.type] = [];
      }
      sensorsByType[sensor.type].push(sensor);
    });

    // Calculate total cable length
    let totalCableLength = 0;
    sensors.forEach((sensor: any) => {
      const connectedBox = junctionBoxes.find((box: any) =>
        box.connectedSensors?.some((s: any) =>
          s.x === sensor.x && s.y === sensor.y && s.z === sensor.z
        )
      );
      if (connectedBox) {
        const distance = Math.sqrt(
          Math.pow(sensor.x - connectedBox.x, 2) +
          Math.pow(sensor.y - connectedBox.y, 2) +
          Math.pow(sensor.z - connectedBox.z, 2)
        );
        totalCableLength += distance;
      }
    });

    // Create context for AI with sensor positions
    const sensorTypesSummary = Object.entries(sensorsByType)
      .map(([type, sensorList]) => {
        // Calculate centroid for this type
        const centroid = {
          x: sensorList.reduce((sum: number, s: any) => sum + s.x, 0) / sensorList.length,
          y: sensorList.reduce((sum: number, s: any) => sum + s.y, 0) / sensorList.length,
          z: sensorList.reduce((sum: number, s: any) => sum + s.z, 0) / sensorList.length,
        };
        return `Type ${type}: ${sensorList.length} sensors (centroid: ${centroid.x.toFixed(1)}, ${centroid.y.toFixed(1)}, ${centroid.z.toFixed(1)})`;
      })
      .join('\n');

    const junctionBoxSummary = junctionBoxes
      .map((box: any) =>
        `Box ${box.id} (Type ${box.sensorTypeId}): ${box.connectedSensors?.length || 0}/${box.ports} ports used at position (${box.x.toFixed(1)}, ${box.y.toFixed(1)}, ${box.z.toFixed(1)})`
      )
      .join('\n');

    const prompt = `You are an expert in 3D sensor network optimization. Analyze the configuration and provide an OPTIMIZED configuration.

SPACE CONFIGURATION:
- Dimensions: ${unitsX} × ${unitsY} × ${unitsZ} units (${totalVolume.toFixed(0)} cubic units)
- Total Sensors: ${totalSensors}
- Total Junction Boxes: ${totalJunctionBoxes}

SENSOR DISTRIBUTION:
${sensorTypesSummary}

JUNCTION BOX CONFIGURATION:
${junctionBoxSummary}

CURRENT METRICS:
- Total Cable Length: ${totalCableLength.toFixed(2)} units
- Average Cable per Sensor: ${(totalCableLength / totalSensors).toFixed(2)} units

YOUR TASK:
Analyze this configuration and provide an OPTIMIZED junction box placement that:
1. Minimizes total cable length
2. Reduces the number of junction boxes where possible (consolidation)
3. Optimally positions junction boxes near sensor clusters
4. Ensures all sensors are covered

IMPORTANT: You must respond with a valid JSON object (and ONLY JSON, no markdown, no explanation before or after) with this exact structure:

{
  "analysis": "Brief analysis of the current configuration and optimization strategy (1-2 sentences)",
  "optimizedBoxes": [
    {
      "sensorTypeId": 0,
      "x": 25.5,
      "y": 30.2,
      "z": 45.8,
      "ports": 12
    }
  ],
  "improvements": {
    "cableLengthReduction": 150.5,
    "boxesRemoved": 2,
    "efficiencyGain": 25.3
  },
  "steps": [
    "🚀 AI analysis started",
    "📊 Analyzed sensor distribution patterns",
    "🎯 Identified optimal clustering strategy",
    "📦 Consolidated junction boxes",
    "✨ Optimized positions for minimum cable length"
  ]
}

CRITICAL RULES:
1. Use K-means clustering or centroid analysis to find optimal positions
2. Ensure x, y, z coordinates are WITHIN bounds: x (0-${unitsX}), y (0-${unitsY}), z (0-${unitsZ})
3. Each optimizedBox must have a sensorTypeId matching one of the sensor types (0-${sensors.length - 1})
4. Ensure enough ports to cover all sensors of that type
5. Try to consolidate boxes where possible (fewer boxes = better)
6. Position boxes near the centroid of sensor clusters
7. Calculate realistic improvements based on sensor positions

Generate the optimized junction box configuration now. Remember: ONLY valid JSON, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in 3D sensor network optimization, specializing in minimizing cable lengths and optimizing junction box placement. You MUST respond with valid JSON only, no markdown, no explanation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    // Parse and validate the JSON response
    let optimizationResult;
    try {
      optimizationResult = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('AI returned invalid JSON');
    }

    return new Response(JSON.stringify(optimizationResult), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('AI Optimization Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate AI optimization' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
