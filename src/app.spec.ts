import chai from 'chai';
import chaiHttp from 'chai-http';
import app from './app';
import {deleteAllTodoItems} from './todo_items';

chai.use(chaiHttp);

describe('app', () => {
  afterEach(async () => {
    await deleteAllTodoItems();
  });

  it('should save and return record in list', async () => {
    const content = 'Test Item';
    const insertedId = await insertRecord(content);

    const getResponse = await chai.request(app)
      .get('/');
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.length).toEqual(1);
    expect(getResponse.body[0].id).toEqual(insertedId);
    expect(getResponse.body[0].content).toEqual(content);
  });

  it('should save and return single record', async () => {
    const content = 'Test Item #2';
    const insertedId = await insertRecord(content);

    const response = await chai.request(app)
      .get(`/${insertedId}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toEqual(insertedId);
    expect(response.body.content).toEqual(content);
  });

  it('should return 400 when inserting empty record', async () => {
    const response = await chai.request(app)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        content: ''
      });
    expect(response.statusCode).toEqual(400);
  });

  it('should return 404 for missing record', async () => {
    const response = await chai.request(app)
      .get('/018c4ab5-e7c7-74a5-9a4d-f26782ea6db9');
    expect(response.statusCode).toEqual(404);
  });

  it('should return 404 for record with invalid id', async () => {
    const response = await chai.request(app)
      .get('/invalid-id');
    expect(response.statusCode).toEqual(404);
  });

  async function insertRecord(content: string): Promise<string> {
    const response = await chai.request(app)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        content
      });
    expect(response.statusCode).toEqual(200);
    return response.body;
  }
});
