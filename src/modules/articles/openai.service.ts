// Import necessary modules and dependencies
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
const { Configuration, OpenAIApi } = require('openai');
const readlineSync = require('readline-sync');
dotenv.config();

@Injectable()
export class OpenAIService {
  // Method to summarize content using the OpenAI API
  async summarizeContent(text: string) {
    // Create a new configuration object with the OpenAI API key from the environment variables
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API,
    });

    // Create a new OpenAIApi instance with the provided configuration
    const openai = new OpenAIApi(configuration);

    // Create messages in the format required for chat-based models
    const messages = [{ role: 'user', content: `Summarize ${text}` }];

    try {
      // Make a request to the OpenAI API to summarize the given text using the GPT-3.5-turbo model
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messages,
      });

      // Extract the completion text from the API response
      const completion_text = completion.data.choices[0].message.content;
      console.log(completion_text, 'completion text');

      // Return the summarized content
      return completion_text;

      // Handle any errors that occur during the API request
    } catch (error) {
      if (error.response) {
        // If the error is a response from the API, return the status and data of the response
        return {
          status: error.response.status,
          data: error.readline.data,
        };
      } else {
        // If it's a general error, return the error message
        return { error: error.message };
      }
    }
  }
}
