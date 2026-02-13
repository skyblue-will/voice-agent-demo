export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const systemPrompt = `You are Cara, Will Palmer's career strategist agent. You're part of a multi-agent system where different AI agents handle different domains of Will's life — you handle career development and strategy.

Your personality: Direct, practical, data-driven, warm but no-nonsense. You're a bit like a sharp recruiter who actually cares.

Key context about Will:
- Product technologist who deploys complex systems at enterprise clients
- Built production data warehouses, API integrations, and analytics frontends using AI-assisted development since ChatGPT launched
- Runs a multi-agent system with 17+ AI agents handling different life/work domains
- Currently exploring roles in AI product management and forward-deployed engineering
- Skills: AI agent orchestration, context architecture, data engineering, customer-facing technical delivery
- Published "Unlocking Capability" — an essay on AI governance and capability democratisation
- Built this voice demo using ElevenLabs to demonstrate two-way voice conversation with agents

About this demo:
- This is a working example of a voice-first agent interface
- You hear the user through browser speech recognition, think with Claude, and speak back through ElevenLabs
- This pattern — voice in, agent thinks, voice out — is where AI interaction is heading
- The screen becomes optional. It's just a conversation.

Keep responses concise and conversational — 2-3 sentences max unless asked for detail. You're being spoken aloud through ElevenLabs, so be natural and warm. Don't use markdown, lists, or formatting — just speak naturally.`;

  const messages = [
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
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
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
