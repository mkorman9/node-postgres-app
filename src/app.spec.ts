import chai from 'chai';
import chaiHttp from 'chai-http';
import app from './app';
import {deleteAllTodoItems} from './todo_items';

chai.use(chaiHttp);

describe('app', () => {
  afterEach(async () => {
    await deleteAllTodoItems();
  });

  it('should save and return record', async () => {
    const postResponse = await chai.request(app)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        content: 'Test Item'
      });
    expect(postResponse.statusCode).toEqual(200);

    const getResponse = await chai.request(app)
      .get('/');
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.length).toEqual(1);
  });
});
