require("module-alias/register");

import chai from "chai";
// tslint:disable-next-line: import-name
import spies from "chai-spies";
chai.use(spies);
import chaiHttp from "chai-http";
import { Application } from "express";
import { respositoryContext, testAppContext } from "../../mocks/app-context";

import { App } from "@server";
import { TodoItem } from "@models";

chai.use(chaiHttp);
const expect = chai.expect;
let expressApp: Application;

before(async () => {
  await respositoryContext.store.connect();
  const app = new App(testAppContext);
  app.initializeMiddlewares();
  app.initializeControllers();
  app.initializeErrorHandling();
  expressApp = app.expressApp;
});

describe("POST /todos", () => {
  it("should create a new todo title", async () => {
    const res = await chai.request(expressApp).post("/todos").send({
      title: "Todo title",
    });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
  });
});

describe("GET /todos/:id", () => {
  it("should fetch a todo item if it exists and if id is valid mongo id", async () => {
    const todoItem = await testAppContext.TodoItemRepository.save(
      new TodoItem({ title: "Fetching an item" })
    );

    const res = await chai.request(expressApp).get(`/todos/${todoItem._id}`);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
  });

  it("Should return a validation error if id is invalid mongo id", async () => {
    const res = await chai.request(expressApp).get("/todos/befji47crhjehr");
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property("failures[0].message")
      .to.equal("Mongo ID is invalid");
  });

  it("should return a 404 if todo item does not exists", async () => {
    const res = await chai
      .request(expressApp)
      .get("/todos/605bb3efc93d78b7f4388c2c");

    expect(res).to.have.status(404);
  });
});
