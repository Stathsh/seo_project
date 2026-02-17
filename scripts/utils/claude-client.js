import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Call Claude API with a system prompt and user message.
 * Returns the text content of the response.
 */
export async function callClaude({ system, prompt, maxTokens = 4096, model, apiKey }) {
  const resolvedKey = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!resolvedKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.'
    );
  }

  const client = new Anthropic({ apiKey: resolvedKey });

  const response = await client.messages.create({
    model: model || DEFAULT_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('No text content in Claude response');
  }

  return textBlock.text;
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
