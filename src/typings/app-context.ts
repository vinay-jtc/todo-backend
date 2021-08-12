import { Repositories } from '@storage';
import { Logger } from '@typings';

export type AppContext = {
  logger: Logger;
  TodoItemRepository: Repositories.TodoItemRepository;
};
