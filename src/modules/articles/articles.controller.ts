// Import nessecery dependencies
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticlesDto } from './dto/create-articles.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesServices: ArticlesService) {}

  // get all articles
  @Get()
  getAll() {
    return this.articlesServices.getAll();
  }
  // create articles summary
  @Post('/create-summary')
  async getArticle(@Body() createArticle: CreateArticlesDto) {
    return await this.articlesServices.createSummary(createArticle);
  }

  // delete articles by specific id
  @Delete('/:id')
  deleteArticles(@Param('id') id: number) {
    return this.articlesServices.deleteOne(id);
  }
}
