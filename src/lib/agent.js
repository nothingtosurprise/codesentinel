import Anthropic from '@anthropic-ai/sdk';
import { loadConfig } from './config.js';

export async function reviewCode({ code, language = 'auto', filename = '' }) {
  const config = loadConfig();
  const apiKey = process.env.ANTHROPIC_API_KEY || config.apiKey;

  if (!apiKey) {
    throw new Error(
      'No API key found!\n\n' +
      'Set it via:\n' +
      '  export ANTHROPIC_API_KEY=your_key\n' +
      '  OR\n' +
      '  codesentinel config --set-key your_key\n\n' +
      'Get your key at: https://console.anthropic.com'
    );
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are CodeSentinel, an elite senior software engineer and security researcher with 15+ years of experience. You perform thorough, actionable code reviews.

You MUST respond with ONLY valid JSON — no markdown, no backticks, no explanations outside the JSON.

Your JSON must follow this exact schema:
{
  "language": "string — detected or specified language",
  "score": "number 1-10 — overall code quality",
  "scoreLabel": "string — Excellent|Good|Fair|Needs Work|Critical",
  "summary": "string — 2-3 sentence executive summary",
  "issues": [
    {
      "id": "number — sequential id",
      "severity": "string — critical|warning|suggestion",
      "category": "string — Security|Bug|Performance|Style|Best Practice|Error Handling",
      "title": "string — short descriptive title",
      "description": "string — clear explanation of the problem",
      "line": "string — e.g. Line 12, Lines 5-8, or General",
      "fix": "string — specific fix recommendation"
    }
  ],
  "metrics": {
    "criticalCount": "number",
    "warningCount": "number",
    "suggestionCount": "number",
    "securityIssues": "number",
    "linesReviewed": "number"
  },
  "fixedCode": "string — complete rewritten code with all issues fixed",
  "highlights": ["string array — 2-3 things the code does well"]
}`;

  const userPrompt = `Review this ${language !== 'auto' ? language : ''} code${filename ? ` from file: ${filename}` : ''}:

\`\`\`
${code}
\`\`\`

Be thorough. Check for: SQL injection, XSS, hardcoded secrets, null/undefined errors, race conditions, memory leaks, missing error handling, insecure dependencies usage, and code quality issues.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  const rawText = message.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Strip any accidental markdown fences
  const clean = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error(`Failed to parse AI response. Raw output:\n${rawText}`);
  }
}
