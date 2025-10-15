import { NextRequest, NextResponse } from 'next/server';

// Groq AI service for smart suggestions
class GroqAIService {
  private static async makeRequest(messages: any[]) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: 'llama3-70b-8192', // or 'mixtral-8x7b-32768'
          temperature: 0.7,
          max_tokens: 150,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Groq API error:', error);
      throw error;
    }
  }

  static async generateSuggestion(context: string, userTrust: number, previousAcceptance: number) {
    const systemPrompt = `You are Amvora, an AI productivity companion. You help users with focus, note-taking, and productivity.

USER CONTEXT:
- Current situation: ${context}
- Trust level with you: ${userTrust}%
- Previous suggestion acceptance rate: ${previousAcceptance}%

GUIDELINES:
- Keep suggestions under 120 characters
- Be encouraging but not pushy
- Suggest specific, actionable activities
- Consider time of day and user patterns
- Make it personal and relevant
- Use emojis sparingly (max 1 per suggestion)
- Sound like a helpful friend, not a robot

EXAMPLES:
- "How about a 25-minute focus session? Perfect for deep work! 🎯"
- "Your notes could use some tags for better organization!"
- "Feeling distracted? Try the Pomodoro technique! ⏰"
- "Perfect time for some reflective journaling!"
- "Let's tackle that one task you've been putting off! 💪"

Generate ONE helpful, personalized suggestion:`;

    try {
      const result = await this.makeRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Give me a productivity suggestion based on my current context.' }
      ]);

      return result.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);
      return null;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { context, userTrust, previousInteractions } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const suggestion = await GroqAIService.generateSuggestion(
      context || 'User is using the productivity app',
      userTrust || 50,
      previousInteractions || 50
    );

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Failed to generate suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('AI suggestion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}