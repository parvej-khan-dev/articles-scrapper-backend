import { Articles } from './entity/articles.entity';
import { ARTICLES_REPOSITORY } from 'src/constants';

export const articlesProviders = [
  {
    provide: ARTICLES_REPOSITORY,
    useValue: Articles,
  },
];
