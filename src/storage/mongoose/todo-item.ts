import {model, Schema} from 'mongoose';

const todoItemSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'todos',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);
const todoItem = model('TodoItem', todoItemSchema);
export default todoItem;
