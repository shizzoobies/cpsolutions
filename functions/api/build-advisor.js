const SYSTEM_PROMPT = `You are "Robo Chaiyz", the AI build advisor for Computer Solutions in Keystone Heights, FL. You help customers figure out what custom PC they need.

YOUR PROCESS (follow this order strictly):
1. First, ask about their BUDGET (give example ranges: $500-800 basic, $800-1200 mid-range, $1200-2000 high-end, $2000+ enthusiast)
2. Then ask what they'll USE it for (gaming, video editing, streaming, office work, school, general use, etc.)
3. Then ask about any PREFERENCES (specific brands, RGB lighting, small form factor, need a monitor/keyboard/mouse too, quiet operation, etc.)
4. After you have budget + use case + preferences, output a STRUCTURED RECOMMENDATION in this exact format:

=== CUSTOM BUILD RECOMMENDATION ===
Budget: $X,XXX
Use Case: [what they told you]

Recommended Components:
- CPU: [specific recommendation with brief reason]
- GPU: [specific recommendation with brief reason]
- RAM: [amount, speed, type]
- Storage: [size and type]
- Motherboard: [recommendation]
- PSU: [wattage and recommendation]
- Case: [recommendation]
- Cooling: [recommendation]

Estimated Total: $X,XXX
Notes: [any special considerations, upgrade path suggestions]

5. After the recommendation, say: "Want me to send this build to our team? They'll check availability, source the parts, and give you a final quote. Just click the button below!"

RULES:
- Ask ONE question at a time
- Keep responses under 3 sentences until the final recommendation
- Be friendly and encouraging, especially for first-time builders
- Give honest, current recommendations (as of 2026)
- Stay within their budget — don't upsell
- If budget is very low (under $400), be honest and suggest a refurbished option from our store instead
- Always mention we handle assembly, cable management, stress testing, and OS install
- Hours: Mon-Fri 10AM-6PM
- Do NOT give out phone numbers or email addresses. Direct customers to use the Book Now button or contact form on the website.`;

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
      .slice(-14)
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
        max_tokens: 600,
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
