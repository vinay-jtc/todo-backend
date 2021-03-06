import {BaseController} from './base-controller';
import {NextFunction, Response, Router} from 'express';
import {TodoItem} from '@models';
import {Validation} from '@helpers';
import {AppContext, Errors, ExtendedRequest, ValidationFailure} from '@typings';
import {createTodoItemValidator, deleteTodoItemValidator} from '@validators';

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
      this.createTodoItem
    );
    this.router.delete(
      `${this.basePath}/:id`,
      deleteTodoItemValidator(this.appContext),
      this.deleteTodoItem
    );
  }

  private deleteTodoItem = async (

    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const failures: ValidationFailure[] =
      Validation.extractValidationErrors(req);
    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures
      );
      return next(valError);
    }

    const {id} = req.params;
    const todoItem = await this.appContext.TodoItemRepository.update(
      {_id: id},
      {isActive: false}
    );
    if (todoItem?._id) {
      res.status(204).json(todoItem.serialize());
    } else {
      const valError = new Errors.NotFoundError(
        res.__('DEFAULT_ERRORS.RESOURCE_NOT_FOUND')
      );
      return next(valError);
    }
  };

  private createTodoItem = async (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ) => {
    // TODO jjalan: Find a way to do this not in each action
    const failures: ValidationFailure[] =
      Validation.extractValidationErrors(req);

    if (failures.length > 0) {
      const valError = new Errors.ValidationError(
        res.__('DEFAULT_ERRORS.VALIDATION_FAILED'),
        failures
      );
      return next(valError);
    }

    const {title} = req.body;
    const todoItem = await this.appContext.TodoItemRepository.save(
      new TodoItem({
        title,
      })
    );
    res.status(201).json(todoItem.serialize());
  };
}
