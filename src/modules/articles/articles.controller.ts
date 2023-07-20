import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticlesDto } from './dto/create-articles.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesServices: ArticlesService) {}

  @Post()
  createArticle(@Body() createArticlesDto: CreateArticlesDto) {
    return this.articlesServices.create(createArticlesDto);
  }

  @Get()
  getAll() {
    return this.articlesServices.getAll();
  }

  @Post('/create-summary')
  async getArticle(@Body() createArticle: CreateArticlesDto) {
    return await this.articlesServices.createSummary(createArticle);
  }

  @Delete('/:id')
  deleteArticles(@Param('id') id: number) {
    return this.articlesServices.deleteOne(id);
  }
}
