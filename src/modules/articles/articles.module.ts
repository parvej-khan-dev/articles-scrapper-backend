import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { articlesProviders } from './articles.provider';
import { OpenAIService } from './openai.service';
// this is article module that control whole follow of articles, services and controller
// we also in import OPENAIService in provide so we can in in articles services
@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService, ...articlesProviders, OpenAIService],
})
export class ArticlesModule {}
