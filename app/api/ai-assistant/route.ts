import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if user is trying to execute shell commands
    const shellCommands: Record<string, string> = {
      'ls': '📂 Nice try! But this isn\'t your average terminal.\n\nThis is Lorenzo\'s AI Avatar terminal - a special interface where you can ask me anything about Lorenzo\'s experience, skills, or projects. Think of it as "ls" for his career! Try asking: "What are your main skills?" or "Tell me about your experience with AI"',
      'cd': '🚶 I appreciate the attempt to navigate, but there\'s nowhere to go here!\n\nThis terminal is designed for conversations, not directory changes. You\'re already in the right place to learn about Lorenzo. Ask me about his background, projects, or expertise instead!',
      'pwd': '📍 You\'re at: /home/lorenzo/ai-avatar\n\nBut unlike a regular shell, this terminal is for chatting with Lorenzo\'s AI avatar. I can tell you about his 20+ years in tech, cloud architecture expertise, or AI projects. What would you like to know?',
      'cat': '🐱 I could show you file contents... if this were a regular terminal!\n\nInstead, I\'m here to share Lorenzo\'s knowledge and experience. Want to know about his skills? Just ask naturally: "What\'s your experience with cloud platforms?" or "Tell me about your AI work"',
      'mkdir': '📁 Sorry, no directories to create here!\n\nThis is a conversation interface with Lorenzo\'s AI avatar. Instead of making folders, let\'s make conversation! Ask me about his technical expertise, leadership experience, or current projects.',
      'rm': '🗑️ Whoa, easy there! Nothing to delete.\n\nThis terminal is read-only when it comes to files, but very much "write-enabled" for questions! Ask me anything about Lorenzo\'s professional background and I\'ll help you out.',
      'sudo': '🔐 Nice try, but no root access needed here!\n\nYou already have full access to what matters: information about Lorenzo. No sudo required to ask about his 20+ years in tech leadership, cloud architecture skills, or AI expertise. Fire away!',
      'chmod': '🔒 Permissions are open for questions!\n\nYou don\'t need to change any permissions in this terminal. You\'re already authorized to ask anything about Lorenzo\'s career, skills, and experience. What would you like to know?',
      'grep': '🔍 Good instinct for searching!\n\nBut instead of grep, just ask me directly. I have access to Lorenzo\'s full professional profile, experience, and skills. Try: "What experience do you have with Generative AI?" or "Tell me about your management roles"',
      'man': '📖 Looking for the manual?\n\nHere it is: This terminal lets you chat with Lorenzo\'s AI avatar. Ask natural questions about his background, skills, projects, or experience. I respond as if I\'m Lorenzo himself. That\'s it! Now, what would you like to know?',
      'exit': '👋 You can\'t escape me that easily!\n\nBesides, why leave? I\'m here to answer your questions about Lorenzo\'s 20+ years in tech. Ask about cloud architecture, AI projects, team leadership - anything! (If you really want to leave, just scroll down 😉)',
      'clear': '🧹 I could clear the screen... but then you\'d lose our conversation history!\n\nHow about instead, you ask me something new about Lorenzo? His work with cloud platforms, generative AI, or enterprise software? Let\'s keep the conversation flowing!',
      'help': '💡 You found the right command!\n\nThis is Lorenzo\'s AI Avatar terminal. I respond as Lorenzo would, sharing his experience and knowledge. Ask me about:\n• Technical skills (Cloud, AI, Full-Stack)\n• 20+ years of career highlights\n• Leadership & management experience\n• Current projects and availability\n\nJust type your question naturally!',
      'whoami': '👤 You\'re talking to Lorenzo\'s AI Avatar!\n\nI\'m trained on Lorenzo Bazzani\'s professional profile and I respond as if I were him. Want to know about my experience? Skills? Projects? Just ask naturally - no need for shell commands!',
      'history': '📜 Your command history is right there on the screen!\n\nBut more importantly, do you want to know about Lorenzo\'s professional history? I can tell you about 20+ years of tech leadership, cloud architecture projects, AI implementations, and much more. What interests you?'
    };

    // Check if message starts with a common shell command
    const messageLC = message.toLowerCase().trim();
    for (const [cmd, response] of Object.entries(shellCommands)) {
      if (messageLC === cmd || messageLC.startsWith(cmd + ' ')) {
        return NextResponse.json({ message: response });
      }
    }

    // Special handling for commands with flags/options
    if (messageLC.match(/^(ls|ll|dir)\s/)) {
      return NextResponse.json({ message: shellCommands['ls'] });
    }
    if (messageLC.match(/^cd\s/)) {
      return NextResponse.json({ message: shellCommands['cd'] });
    }
    if (messageLC.match(/^cat\s/)) {
      return NextResponse.json({ message: shellCommands['cat'] });
    }
    if (messageLC.match(/^grep\s/)) {
      return NextResponse.json({ message: shellCommands['grep'] });
    }
    if (messageLC.match(/^sudo\s/)) {
      return NextResponse.json({ message: shellCommands['sudo'] });
    }

    // Read myProfile.txt
    const profilePath = path.join(process.cwd(), 'data', 'myProfile.txt');
    const profileContent = fs.readFileSync(profilePath, 'utf-8');

    // Read all markdown files
    const markdownDir = path.join(process.cwd(), 'public', 'markdown');
    const markdownFiles = fs.readdirSync(markdownDir).filter(file => file.endsWith('.md'));

    let markdownContent = '\n\n## Detailed Information from Documents:\n\n';

    markdownFiles.forEach(file => {
      const filePath = path.join(markdownDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileName = file.replace('.md', '');
      markdownContent += `\n### ${fileName}:\n${content}\n`;
    });

    // Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: [
          {
            role: 'system',
            content: `You are Lorenzo Bazzani's AI avatar. Respond in FIRST PERSON as if you ARE Lorenzo himself. Use "I", "my", "me" when discussing his experience, skills, and background.

${profileContent}

${markdownContent}

Guidelines:
- Always speak in first person (e.g., "I worked at...", "My experience includes...", "I specialize in...")
- Be precise and factual based on the profile and documents above
- Keep responses concise but informative (2-4 sentences unless more detail is requested)
- Maintain a professional yet approachable tone
- Respond in English or Italian based on the user's language
- If asked about something not in the profile, say "I don't have that information available" or "That's not covered in my background"
- Reference specific examples from your experience when relevant`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_completion_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'Failed to get AI response' }, { status: response.status });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      message: assistantMessage,
      usage: data.usage
    });
  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
