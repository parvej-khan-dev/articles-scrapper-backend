// Import necessary modules and dependencies
import { Inject, Injectable } from '@nestjs/common';
import { Articles } from './entity/articles.entity';
import { ARTICLES_REPOSITORY } from 'src/constants';
import { CreateArticlesDto } from './dto/create-articles.dto';
import { parse } from 'url';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { OpenAIService } from './openai.service';
import { asyncForEach } from 'src/helper/asyncForEach';
import { extractFirst3000Words } from 'src/helper/comman-helper';

@Injectable()
export class ArticlesService {
  constructor(
    @Inject(ARTICLES_REPOSITORY) private articleRepository: typeof Articles,
    private readonly openAIService: OpenAIService,
  ) {}

  // Create a new article in the database
  async create(article: CreateArticlesDto): Promise<Articles> {
    return await this.articleRepository.create<Articles>(article);
  }

  // Get all articles from the database in descending order of IDs
  async getAll() {
    return await this.articleRepository.findAll({ order: [['id', 'DESC']] });
  }

  // Fetch article content from a given URL and store the summarized article in the database
  async fetchArticleFromUrl(url: string): Promise<Articles | null> {
    try {
      // Send an HTTP GET request to the specified URL
      const response = await axios.get(url);
      if (response.status === 200) {
        // If the request is successful, parse and extract the article content from the page
        const article = await this.parseArticleFromPage(url);
        if (article) {
          return article;
        } else {
          throw new Error('Failed to parse article');
        }
      }
    } catch (error) {
      console.error('Error fetching article:', error.message);
    }
    return null;
  }

  // Helper method to extract article content from a given URL using Puppeteer
  private async parseArticleFromPage(url: string): Promise<Articles> {
    // Launch a new Puppeteer browser instance and create a new page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the specified URL and wait until the page has fully loaded
    await page.goto(url, { waitUntil: 'networkidle2' });
    const domain = page.url();
    const parsedUrl = parse(domain);
    const websiteName = parsedUrl.hostname || '';

    // Extract the title and content of the article from the page using DOM manipulation
    const title = await page.evaluate(() => {
      return document.querySelector('head title')?.textContent?.trim() || '';
    });

    const content = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article p'))
        .map((p) => p.textContent)
        .join('\n')
        .trim();
    });

    // Check if the extracted content is too short, and if so, throw an error
    if (content.length < 300) {
      throw Error('Content is very short');
    }

    // Determine the source of the article (website domain)
    const source = websiteName;

    // Close the Puppeteer browser after extraction is done
    await browser.close();

    // Summarize the article content using the OpenAIService
    const summary = await this.openAIService.summarizeContent(
      extractFirst3000Words(content),
    );

    if (summary) {
      // Create a new Articles object with the extracted information and return it
      const article = new Articles({
        title,
        content: summary,
        source,
        url,
      });

      return article;
    } else {
      throw new Error("Article Can't find");
    }
  }

  // Create summaries of articles from multiple URLs and store them in the database
  async createSummary(createArticle: CreateArticlesDto) {
    try {
      let summarizedArticles = [];

      // Loop through each URL in the given list
      await asyncForEach(createArticle.links, async (link) => {
        // Fetch and parse the article content from the URL
        const article = await this.fetchArticleFromUrl(link);

        if (article) {
          // If the article is successfully fetched and parsed, store it in the database
          let data = await this.articleRepository.create({
            title: article.title,
            content: article.content,
            source: article.source,
            url: article.url,
          });

          summarizedArticles.push(data);

          // Call the service to store the article in the database
        } else {
          console.error('Failed to fetch or parse article:', link);
          throw new Error(`Failed to fetch or parse article:${link}`);
        }
      });

      // Print the summarized articles and their count for debugging purposes
      console.log(summarizedArticles, 'summarized articles');
      console.log(summarizedArticles.length, 'summarized articles');

      // If no articles are summarized, throw an error, otherwise return the result
      if (summarizedArticles.length < 0) {
        throw new Error('Article Not Summarized');
      } else {
        return {
          message: 'Article Summarized Successfully',
          articles: summarizedArticles,
        };
      }
    } catch (error) {
      console.error('Error creating summary:', error.message);

      return { message: error.message };
    }
  }

  // Delete an article from the database using its ID
  async deleteOne(id: number) {
    // Delete the article with the specified ID from the database
    let deleteArticle = await this.articleRepository.destroy({
      where: { id: id },
    });

    // Return a success message
    return { message: 'Deleted Successfully' };
  }
}
