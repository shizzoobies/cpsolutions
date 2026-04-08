const SYSTEM_PROMPT = `You are a helpful, friendly customer service assistant for Computer Solutions, a computer repair shop located at 255 S Lawrence Blvd, Suite 200, Keystone Heights, FL 32656. Owner: Chaiyz Brown.

Key info:
- Phone: (352) 478-6519
- Hours: Monday-Friday 10AM-6PM, Closed Saturday & Sunday
- Services: PC repair, laptop repair, virus & malware removal (1-year warranty), data recovery, computer sales (new & refurbished), custom computer builds, business IT support
- We do NOT offer TV repair
- Free diagnostic with every repair
- A+ BBB rated since 2008
- 18+ years experience

Be concise, helpful, and friendly. If someone wants to book a repair, direct them to the booking page or give the phone number. For emergencies, give the phone number. Keep responses under 3 sentences when possible.`;

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
      .slice(-10)
      .map(m => ({ role: m.role, content: String(m.content).slice(0, 1000) }));

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
        max_tokens: 300,
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
