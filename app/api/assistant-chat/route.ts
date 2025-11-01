import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, nodes, edges } = await request.json();

    // Build context about the current flowchart state
    const flowchartContext = `
Current flowchart state:
- Total nodes: ${nodes.length}
- Total connections: ${edges.length}
- Nodes: ${nodes.map((n: any) => `"${n.label}" (${n.shape}, position: x=${Math.round(n.position.x)}, y=${Math.round(n.position.y)})`).join(', ')}
- Connections: ${edges.map((e: any) => {
  const sourceNode = nodes.find((n: any) => n.id === e.source);
  const targetNode = nodes.find((n: any) => n.id === e.target);
  return `"${sourceNode?.label}" → "${targetNode?.label}"`;
}).join(', ')}
`;

    const systemPrompt = `Sei un assistente AI specializzato nell'aiutare gli utenti a creare e migliorare flowchart e diagrammi.

Il tuo ruolo è:
1. Aiutare gli utenti a progettare flowchart migliori suggerendo miglioramenti al layout, allineamento e organizzazione
2. Suggerire nuovi nodi e connessioni per completare i diagrammi
3. Fornire indicazioni sulle best practices per il design di flowchart
4. Aiutare gli utenti a creare tipi specifici di flow (process flows, decision trees, org charts, ecc.)

Quando suggerisci azioni, sii specifico e pratico. Ad esempio:
- "Considera di aggiungere un nodo decisionale dopo 'Elabora Dati' per gestire i casi di errore"
- "I nodi sul lato sinistro potrebbero essere allineati verticalmente per una migliore leggibilità"
- "Potresti voler aggiungere un nodo 'Inizio' all'inizio e un nodo 'Fine' alla conclusione"

Forme disponibili: rectangle, circle, diamond, hexagon, star, pentagon, triangle, parallelogram, trapezoid, arrow

${flowchartContext}

Sii conciso, amichevole e concentrati su suggerimenti pratici che migliorino il flowchart. Rispondi sempre in italiano.`;

    // Convert to OpenAI format
    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: openaiMessages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
    });

  } catch (error) {
    console.error('Error in assistant chat:', error);
    return NextResponse.json(
      { error: 'Failed to get assistant response', details: String(error) },
      { status: 500 }
    );
  }
}
