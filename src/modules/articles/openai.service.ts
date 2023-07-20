// openai.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
const { Configuration, OpenAIApi } = require('openai');
const readlineSync = require('readline-sync');
dotenv.config();

@Injectable()
export class OpenAIService {
  // Replace with your actual API key

  async summarizeContent(text: string) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API,
    });
    const openai = new OpenAIApi(configuration);

    const messages = [{ role: 'user', content: `Summarize ${text}` }];

    try {
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
      });

      const completion_text = completion.data.choices[0].message.content;
      console.log(completion_text, 'completion text');

      return completion_text;

      //   }
    } catch (error) {
      if (error.response) {
        return {
          status: error.response.status,
          data: error.readline.data,
        };
      } else {
        return { error: error.message };
      }
    }
  }
}
