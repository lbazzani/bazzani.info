import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

export async function POST(request: NextRequest) {
  try {
    const diagramData = await request.json();
    const { nodes, edges } = diagramData;

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ error: 'No nodes provided' }, { status: 400 });
    }

    // Create presentation
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();

    // Add title
    slide.addText('Flowchart Diagram', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.6,
      fontSize: 28,
      bold: true,
      color: '2962FF',
    });

    // Calculate bounds
    const xPos = nodes.map((n: any) => n.position.x);
    const yPos = nodes.map((n: any) => n.position.y);
    const xMax = nodes.map((n: any) => n.position.x + (n.width || 120));
    const yMax = nodes.map((n: any) => n.position.y + (n.height || 60));

    const minX = Math.min(...xPos);
    const maxX = Math.max(...xMax);
    const minY = Math.min(...yPos);
    const maxY = Math.max(...yMax);

    const canvasWidth = maxX - minX;
    const canvasHeight = maxY - minY;

    // Calculate scale
    const availableWidth = 9;
    const availableHeight = 6;
    const scaleX = availableWidth / (canvasWidth / 96);
    const scaleY = availableHeight / (canvasHeight / 96);
    const scale = Math.min(scaleX, scaleY, 1.0);

    // Store node positions for connectors
    const nodeShapes: Record<string, { x: number; y: number; w: number; h: number }> = {};

    // Add nodes
    nodes.forEach((node: any) => {
      const relX = node.position.x - minX;
      const relY = node.position.y - minY;
      const x = 0.5 + (relX / 96) * scale;
      const y = 1.2 + (relY / 96) * scale;
      const w = ((node.width || 120) / 96) * scale;
      const h = ((node.height || 60) / 96) * scale;

      // Store for connectors
      nodeShapes[node.id] = { x, y, w, h };

      // Map shapes
      const shapeMap: Record<string, any> = {
        rectangle: 'roundRect',
        circle: 'ellipse',
        diamond: 'diamond',
        hexagon: 'hexagon',
        star: 'star5',
        pentagon: 'pentagon',
        triangle: 'triangle',
        parallelogram: 'parallelogram',
        trapezoid: 'trapezoid',
        arrow: 'rightArrow',
      };

      const shape = shapeMap[node.shape || 'rectangle'] || 'roundRect';

      slide.addShape(shape, {
        x,
        y,
        w,
        h,
        fill: { color: (node.bgColor || '#42a5f5').replace('#', '') },
        line: { color: (node.bgColor || '#42a5f5').replace('#', ''), width: 2 },
      });

      // Add text
      slide.addText(node.label || '', {
        x,
        y,
        w,
        h,
        fontSize: Math.min(Math.max(node.fontSize || 14, 8), 48),
        color: (node.textColor || '#ffffff').replace('#', ''),
        bold: true,
        align: 'center',
        valign: 'middle',
      });
    });

    // Add connectors
    if (edges && edges.length > 0) {
      edges.forEach((edge: any) => {
        const src = nodeShapes[edge.source];
        const tgt = nodeShapes[edge.target];

        if (!src || !tgt) return;

        // Calculate connection points
        const srcHandle = edge.sourceHandle || '';
        const tgtHandle = edge.targetHandle || '';

        let sx = src.x + src.w / 2;
        let sy = src.y + src.h / 2;
        let tx = tgt.x + tgt.w / 2;
        let ty = tgt.y + tgt.h / 2;

        // Source point
        if (srcHandle.includes('right')) {
          sx = src.x + src.w;
          sy = src.y + src.h / 2;
        } else if (srcHandle.includes('left')) {
          sx = src.x;
          sy = src.y + src.h / 2;
        } else if (srcHandle.includes('top')) {
          sx = src.x + src.w / 2;
          sy = src.y;
        } else if (srcHandle.includes('bottom')) {
          sx = src.x + src.w / 2;
          sy = src.y + src.h;
        }

        // Target point
        if (tgtHandle.includes('right')) {
          tx = tgt.x + tgt.w;
          ty = tgt.y + tgt.h / 2;
        } else if (tgtHandle.includes('left')) {
          tx = tgt.x;
          ty = tgt.y + tgt.h / 2;
        } else if (tgtHandle.includes('top')) {
          tx = tgt.x + tgt.w / 2;
          ty = tgt.y;
        } else if (tgtHandle.includes('bottom')) {
          tx = tgt.x + tgt.w / 2;
          ty = tgt.y + tgt.h;
        }

        // Add connector line with arrow
        slide.addShape('line', {
          x: sx,
          y: sy,
          w: tx - sx,
          h: ty - sy,
          line: {
            color: '666666',
            width: 2,
            endArrowType: 'arrow',
          },
        });
      });
    }

    // Generate the file
    const fileBuffer = await pptx.write({ outputType: 'nodebuffer' });

    // Return as response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="flowchart_${Date.now()}.pptx"`,
      },
    });
  } catch (error) {
    console.error('Error generating PPT:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
