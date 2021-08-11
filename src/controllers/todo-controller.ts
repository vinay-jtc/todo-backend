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
  createTodoValidator
} from '@validators';

export class TodoController extends BaseController {
  public basePath: string = '/todos';
  public router: Router = Router();

  constructor(ctx: AppContext) {
    super(ctx);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.basePath}`,
      createTodoValidator(),
      this.createAccount,
    );
  }

  private createAccount = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // TODO jjalan: Find a way to do this not in each action
    const failures: ValidationFailure[] = Validation.extractValidationErrors(
      req,
    );
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures,
      );
      return next(valError);
    }

    const { title } = req.body;
    const todo = await this.appContext.todoRepository.save(
      new TodoItem({
        title
      }),
    );
    res.status(201).json(todo.serialize());
  }
  }
