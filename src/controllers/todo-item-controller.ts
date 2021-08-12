import { BaseController } from './base-controller';
import { NextFunction, Response, Router } from 'express';
import { Validation } from '@helpers';
import { TodoItem } from '@models';
import {
  AppContext,
  Errors,
  ExtendedRequest,
  ValidationFailure,
} from '@typings';
import {
  createTodoItemValidator
} from '@validators';

export class TodoItemController extends BaseController {
  public basePath: string = '/todos';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.basePath}`,
      createTodoItemValidator(),
      this.createTodoItem,
    );

    this.router.get(
      `${this.basePath}/:id`,
      this.getTodoItem,
    );
  }

  private getTodoItem = async(
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,)=>{
      const {id} = req.params;
      const todoItem = await this.appContext.TodoItemRepository.findOne({_id:id});
      res.status(200).json(todoItem.serialize());
    }

  private createTodoItem = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // TODO jjalan: Find a way to do this not in each action
    const failures: ValidationFailure[] = Validation.extractValidationErrors(req);
    
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures,
      );
      return next(valError);
    }

    const { title } = req.body;
    const todoItem = await this.appContext.TodoItemRepository.save(
      new TodoItem({
        title
      }),
    );
    res.status(201).json(todoItem.serialize());
  }
  }
