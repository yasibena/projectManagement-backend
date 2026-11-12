import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  private readonly client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
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

      return response.choices[0]?.message?.content ?? '';
    } catch (error) {
      console.error('Groq request failed:', error);

      throw new ServiceUnavailableException(
        'AI analysis is temporarily unavailable.',
      );
    }
  }
}
