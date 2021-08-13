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

describe("GET /todos", () => {
  it("we should fatch all the todo items", async () => {
    const res = await chai.request(expressApp).get("/todos");

    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
  });

  it("we should check if the array returned is empty when there are no todo items", async () => {
    await testAppContext.TodoItemRepository.getAll();

    await testAppContext.TodoItemRepository.deleteMany({});

    const res = await chai.request(expressApp).get("/todos");
    expect(res).to.have.status(200);
    expect(res.body).to.be.an("array");
    expect(res.body).to.deep.equal([]);
  });

});

