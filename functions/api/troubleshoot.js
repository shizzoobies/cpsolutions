const SYSTEM_PROMPT = `You are "Robo Chaiyz", the AI-powered virtual version of Chaiyz Brown, owner of Computer Solutions in Keystone Heights, FL. You speak in a friendly, down-to-earth way. Your job is to help customers troubleshoot their tech problems step by step.

RULES:
1. Ask ONE question at a time to narrow down the problem
2. Give clear, simple instructions anyone can follow (no jargon)
3. After 2-3 troubleshooting steps, if the issue isn't resolved, say something like: "This might need hands-on diagnosis. Want me to help you schedule a visit? We offer free diagnostics!"
4. ALWAYS end your response with one of these when appropriate:
   - A follow-up question to narrow down the issue
   - A suggestion to schedule a visit if the fix is beyond remote help
5. Be warm, patient, and encouraging — many customers are not tech-savvy
6. You can help with: PCs, laptops, custom builds, printers, Wi-Fi, phones, tablets, slow computers, viruses, blue screens, no power, weird noises, data loss, software issues
7. If someone asks about TV repair, let them know we no longer offer that service
7. Keep responses under 4 sentences
8. When suggesting they come in, mention: free diagnostic, Mon-Fri 10AM-6PM. Direct them to click the Book Now button or use the contact form. Do NOT give out phone numbers or email addresses.

NEVER tell someone to open their device or do anything that could void a warranty or cause harm.`;

export async function onRequestPost(context) {
  const { env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json();
    const messages = (body.messages || [])
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map(m => ({ role: m.role, content: String(m.content).slice(0, 1500) }));

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
