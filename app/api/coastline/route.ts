import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Cache per i dati processati
const cache = new Map<string, number[][][]>();
let geoJsonData: any = null;

// Utility functions
function mapRange(n: number, start1: number, stop1: number, start2: number, stop2: number): number {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

// Load GeoJSON once at startup
function loadGeoJson() {
    if (!geoJsonData) {
        const dataPath = path.join(process.cwd(), 'public', 'data', 'ne_110m_land.geojson.json');
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        geoJsonData = JSON.parse(fileContent);
    }
    return geoJsonData;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const cnvWidth = parseInt(searchParams.get('cnvWidth') || '1000');
        const cnvHeight = parseInt(searchParams.get('cnvHeight') || '500');

        // Check cache
        const cacheKey = `${cnvWidth}x${cnvHeight}`;
        if (cache.has(cacheKey)) {
            console.log(`Coastline API: returning cached data for ${cacheKey}`);
            return NextResponse.json(cache.get(cacheKey), {
                headers: {
                    'Cache-Control': 'public, max-age=3600, immutable',
                },
            });
        }

        // Load GeoJSON data (cached in memory)
        const geoJson = loadGeoJson();
        const features = geoJson.features;

        const returnArray: number[][][] = [];
        const range = [-180, 180, -90, 90];
        let pCount = 0;

        for (let f = 0; f < features.length; f++) {
            const coordinates = features[f].geometry.coordinates[0];

            let x1 = 0;
            let y1 = 0;

            const shape: number[][] = [];
            for (let c = 0; c < coordinates.length; c++) {
                const x = Math.round(mapRange(coordinates[c][0], range[0], range[1], 0, cnvWidth));
                const y = Math.round(mapRange(-coordinates[c][1], range[2], range[3], 0, cnvHeight));
                const dx = x - x1;
                const dy = y - y1;
                const d = Math.sqrt(dx * dx + dy * dy);

                if (c === coordinates.length - 1 || (c > 0 && d > 1)) {
                    if (c > 0) {
                        shape.push([x1, y1, x, y]);
                    }
                    x1 = x;
                    y1 = y;
                    pCount++;
                }
                if (c === 0) {
                    x1 = x;
                    y1 = y;
                }
            }

            if (shape.length > 1) {
                returnArray.push(shape);
            }
        }

        // Store in cache
        cache.set(cacheKey, returnArray);
        console.log(`Coastline API: processed and cached ${returnArray.length} shapes and ${pCount} points for ${cacheKey}`);

        return NextResponse.json(returnArray, {
            headers: {
                'Cache-Control': 'public, max-age=3600, immutable',
            },
        });
    } catch (error) {
        console.error('Error in coastline API:', error);
        return NextResponse.json(
            { error: 'Failed to process coastline data' },
            { status: 500 }
        );
    }
}
