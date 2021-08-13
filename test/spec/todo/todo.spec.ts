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

  it("should return a validation error if empty title is specified", async () => {
    const res = await chai.request(expressApp).post("/todos").send({
      title: "",
    });
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property("failures[0].message")
      .to.equal("Please specify the valid title");
  });
});

describe("PUT /todos/:id", () => {
  it("should return 200 if todo exists and title is validately true and 400 if title is empty or not a string else 404", async () => {
    let todoItem = await testAppContext.TodoItemRepository.save(
      new TodoItem({ title: "Todo Item Added" })
    );

    if (todoItem._id) {
      const res1 = await chai
        .request(expressApp)
        .put(`/todos/${todoItem._id}`)
        .send({
          title: "To update",
        });
      expect(res1).to.have.status(200);
      expect(res1.body).to.have.property("id");
      expect(res1.body).to.have.property("title");

      const res2 = await chai
        .request(expressApp)
        .put(`/todos/${todoItem._id}`)
        .send({
          title: "",
        });
      expect(res2).to.have.status(400);
      expect(res2.body)
        .to.have.nested.property("failures[0].message")
        .to.equal("Please specify the valid title");

      const res4 = await chai
        .request(expressApp)
        .put(`/todos/hdjkfffm8efe`)
        .send({
          title: "id not valid",
        });
      expect(res4).to.have.status(400);
      expect(res4.body)
        .to.have.nested.property("failures[0].message")
        .to.equal("Mongo ID is invalid");
    }
  });

  it("should return a 404 if todo item does not exists", async () => {
    const res = await chai
      .request(expressApp)
      .get("/todos/605bb3efc93d78b7f4388c2c");

    expect(res).to.have.status(404);
  });
});
