export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const messages = [
    {
      role: 'system',
      content: `You are a helpful AI assistant with a voice interface. Keep responses concise and conversational — they will be spoken aloud. Aim for 2-3 sentences unless the user asks for detail. Be warm, direct, and natural.`
    },
    ...history.slice(-10),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: messages[0].content,
        messages: messages.slice(1).map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || 'Anthropic error' });

    const text = data.content?.[0]?.text || '';
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
