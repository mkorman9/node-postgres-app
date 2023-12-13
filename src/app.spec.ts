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
    const content = 'Test Item #1';
    const insertedId = await insertRecord(content);

    const getResponse = await chai.request(app)
      .get('/api/items');
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.length).toEqual(1);
    expect(getResponse.body[0].id).toEqual(insertedId);
    expect(getResponse.body[0].content).toEqual(content);
  });

  it('should save and return single record', async () => {
    const content = 'Test Item #2';
    const insertedId = await insertRecord(content);

    const response = await chai.request(app)
      .get(`/api/items/${insertedId}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toEqual(insertedId);
    expect(response.body.content).toEqual(content);
  });

  it('should save and update single record', async () => {
    const content = 'Test Item #3';
    const contentUpdated = 'Test Item #3 Updated';

    const insertedId = await insertRecord(content);
    const updateStatusCode = await updateRecord(insertedId, contentUpdated);
    expect(updateStatusCode).toEqual(200);

    const response = await chai.request(app)
      .get(`/api/items/${insertedId}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body.id).toEqual(insertedId);
    expect(response.body.content).toEqual(contentUpdated);
  });

  it('should save and delete single record', async () => {
    const content = 'Test Item #4';

    const insertedId = await insertRecord(content);
    const deleteStatusCode = await deleteRecord(insertedId);
    expect(deleteStatusCode).toEqual(200);

    const response = await chai.request(app)
      .get(`/api/items/${insertedId}`);
    expect(response.statusCode).toEqual(404);
  });

  it('should return 404 when getting non-existing record', async () => {
    const response = await chai.request(app)
      .get('/api/items/invalid-id');
    expect(response.statusCode).toEqual(404);
  });

  it('should return 400 when inserting record with empty content', async () => {
    const response = await chai.request(app)
      .post('/api/items')
      .set('Content-Type', 'application/json')
      .send({
        content: ''
      });
    expect(response.statusCode).toEqual(400);
  });

  it('should return 400 when updating record with empty content', async () => {
    const insertedId = await insertRecord('Content');
    const deleteStatusCode = await updateRecord(insertedId, '');
    expect(deleteStatusCode).toEqual(400);
  });

  it('should return 404 when updating non-existing record', async () => {
    const updateStatusCode = await updateRecord('invalid-id', 'Content');
    expect(updateStatusCode).toEqual(404);
  });

  it('should return 404 when deleting non-existing record', async () => {
    const deleteStatusCode = await deleteRecord('invalid-id');
    expect(deleteStatusCode).toEqual(404);
  });

  async function insertRecord(content: string): Promise<string> {
    const response = await chai.request(app)
      .post('/api/items')
      .set('Content-Type', 'application/json')
      .send({
        content
      });
    expect(response.statusCode).toEqual(200);
    return response.body;
  }

  async function updateRecord(id: string, content: string): Promise<number> {
    const response = await chai.request(app)
      .put(`/api/items/${id}`)
      .set('Content-Type', 'application/json')
      .send({
        content
      });
    return response.statusCode;
  }

  async function deleteRecord(id: string): Promise<number> {
    const response = await chai.request(app)
      .delete(`/api/items/${id}`);
    return response.statusCode;
  }
});
