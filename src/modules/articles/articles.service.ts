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

  async create(article: CreateArticlesDto): Promise<Articles> {
    return await this.articleRepository.create<Articles>(article);
  }

  async getAll() {
    return await this.articleRepository.findAll({ order: [['id', 'DESC']] });
  }

  async fetchArticleFromUrl(url: string): Promise<Articles | null> {
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        const article = await this.parseArticleFromPage(url);
        return article;
      }
    } catch (error) {
      console.error('Error fetching article:', error.message);
    }
    return null;
  }

  // extract content from link
  private async parseArticleFromPage(url: string): Promise<Articles> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    const domain = page.url();
    const parsedUrl = parse(domain);
    const websiteName = parsedUrl.hostname || '';

    const title = await page.evaluate(() => {
      return document.querySelector('head title')?.textContent?.trim() || '';
    });

    const content = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article p'))
        .map((p) => p.textContent)
        .join('\n')
        .trim();
    });

    const source = websiteName;

    await browser.close();
    const summary = await this.openAIService.summarizeContent(
      extractFirst3000Words(content),
    );
    if (summary) {
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

  async createSummary(createArticle: CreateArticlesDto) {
    try {
      let summarizedArticles = [];
      await asyncForEach(createArticle.links, async (link) => {
        const article = await this.fetchArticleFromUrl(link);

        if (article) {
          let data = await this.articleRepository.create({
            title: article.title,
            content: article.content,
            source: article.source,
            url: article.url,
          });

          summarizedArticles.push(data);

          // Call the service to store the article in the database
        } else {
          return { message: 'Failed to fetch article' };
        }
      });
      if (summarizedArticles.length < 0) {
        throw Error('Article Not Summarizes');
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

  async deleteOne(id: number) {
    let deleteArticle = await this.articleRepository.destroy({
      where: { id: id },
    });
    console.log(deleteArticle, 'hhhhhhh');
    return { message: 'Deleted Successfully' };
  }
}
