import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly model = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';
  private readonly client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    this.client = new Groq({ apiKey });
  }

  async generate(prompt: string): Promise<string> {
    try {
      this.logger.log(`Sending analysis request to Groq (${this.model})`);

      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful project-management assistant. Do not invent facts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const message = response.choices[0]?.message?.content?.trim();

      if (!message) {
        throw new Error('Groq returned an empty response');
      }

      this.logger.log('Groq analysis response received');
      return message;
    } catch (error) {
      this.logger.error('Groq request failed', error);

      throw new ServiceUnavailableException(
        'AI analysis is temporarily unavailable.',
      );
    }
  }
}
