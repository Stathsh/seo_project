import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Call Claude API with a system prompt and user message.
 * Returns the text content of the response.
 */
export async function callClaude({ system, prompt, maxTokens = 4096, model, apiKey, usageFile }) {
  const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!resolvedKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.'
    );
  }

  const client = new Anthropic({ apiKey: resolvedKey });
  const usedModel = model || DEFAULT_MODEL;

  const response = await client.messages.create({
    model: usedModel,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  });

  if (usageFile && response.usage) {
    trackUsage(usageFile, {
      timestamp: new Date().toISOString(),
      model: usedModel,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });
  }

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('No text content in Claude response');
  }

  return textBlock.text;
}

function trackUsage(usageFile, record) {
  try {
    let data = { calls: [] };
    if (fs.existsSync(usageFile)) {
      data = JSON.parse(fs.readFileSync(usageFile, 'utf-8'));
      if (!Array.isArray(data.calls)) data.calls = [];
    }
    data.calls.push(record);
    fs.writeFileSync(usageFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to track API usage:', e.message);
  }
}

/**
 * Generate content with retry logic and rate limiting.
 */
export async function generateWithRetry({ system, prompt, maxTokens = 4096, maxRetries = 3, model, apiKey }) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callClaude({ system, prompt, maxTokens, model, apiKey });
    } catch (error) {
      const isRateLimit = error?.status === 429;
      const isOverloaded = error?.status === 529;

      if ((isRateLimit || isOverloaded) && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`  Rate limited, waiting ${Math.round(waitTime / 1000)}s (attempt ${attempt}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw error;
    }
  }
}
