import { check, ValidationChain } from 'express-validator';

const createTodoItemValidator = (): ValidationChain[] => [
  check('title', 'VALIDATION_ERRORS.INVALID_TITLE').notEmpty()
];

export default createTodoItemValidator;
