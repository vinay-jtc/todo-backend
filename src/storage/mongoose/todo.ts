import { model, Schema } from "mongoose";

const todoItemSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    collection: "todos",
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
const todoItem = model("Todo", todoItemSchema);
export default todoItem;
