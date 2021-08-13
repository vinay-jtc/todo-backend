require('module-alias/register');

import chai from 'chai';
// tslint:disable-next-line: import-name
import spies from 'chai-spies';
chai.use(spies);
import chaiHttp from 'chai-http';
import {Application} from 'express';
import {respositoryContext, testAppContext} from '../../mocks/app-context';

import {App} from '@server';
import {TodoItem} from '@models';

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

describe('PUT /todos/:id', () => {
  it('should return 200 if todo exists & id is valid mongo id & title is not empty', async () => {
    let todoItem = await testAppContext.TodoItemRepository.save(
      new TodoItem({title: 'Todo Item Added'})
    );
    const res = await chai
      .request(expressApp)
      .put(`/todos/${todoItem._id}`)
      .send({
        title: 'To update',
      });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('title');
  })

  it('should return 400 if todo exists & id is valid mongo id & title is empty', async () => {
    let todoItem = await testAppContext.TodoItemRepository.save(
      new TodoItem({title: 'Todo Item Added'})
    );
    const res = await chai
      .request(expressApp)
      .put(`/todos/${todoItem._id}`)
      .send({
        title: '',
      });
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property('failures[0].message')
      .to.equal('Please specify the valid title');
  })

  it('should return 400 if id is valid mongo id', async () => {
    const res = await chai
      .request(expressApp)
      .put(`/todos/hdjkfffm8efe`)
      .send({
        title: 'id not valid',
      });
    expect(res).to.have.status(400);
    expect(res.body)
      .to.have.nested.property('failures[0].message')
      .to.equal('Mongo ID is invalid');
  });

  it('should return 404 if todo item not found', async () => {
    const res = await chai
      .request(expressApp)
      .put(`/todos/60e6a930d1df5518e185ba05`)
      .send({
        title: 'id not valid',
      });
    expect(res).to.have.status(404);
  });
});
