require('module-alias/register');

import chai from 'chai';
// tslint:disable-next-line: import-name
import spies from 'chai-spies';
chai.use(spies);
import chaiHttp from 'chai-http';
import {Application} from 'express';
import {respositoryContext, testAppContext} from '../../mocks/app-context';

import {App} from '@server';
import {TodoItem} from "@models"


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

describe('POST /todos', () => {
  it('should create a new todo title', async () => {
    const res = await chai.request(expressApp).post('/todos').send({
      title: 'Todo title',
    });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('title');
  });

  it('should return a validation error if empty title is specified', async () => {
    const res = await chai.request(expressApp).post('/todos').send({
      title: '',
    });
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property('failures[0].message')
      .to.equal('Please specify the valid title');
  });
});


describe("DELETE /todos/:id", () => {
  it("should return 204 if todo exists and id is valid mongo id", async () => {
    let todo = await testAppContext.TodoItemRepository.save(
      new TodoItem({ title: "Todo item delete" })
    );
    const res1 = await chai.request(expressApp).delete(`/todos/${todo._id}`);
    expect(res1).to.have.status(204);
  });

  it("should return a validation error if id is not a valid mongo ID.", async () => {
    const res = await chai.request(expressApp).delete("/todos/nkrekl890ielj9re");
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property("failures[0].message")
      .to.equal(
        "Mongo ID is invalid"
      );
  });

  it("should return a validation error if todo item does not exists and if id is a valid.", async () => {
    const res = await chai.request(expressApp).delete("/todos/60d2fe74bd99a211407165e9");
    expect(res).to.have.status(404);
  });
})
