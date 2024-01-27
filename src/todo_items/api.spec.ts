import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app';
import {deleteAllTodoItems} from './model';

chai.use(chaiHttp);

describe('Todo Items API', () => {
  afterEach(async () => {
    await deleteAllTodoItems();
  });

  it('should save and return record in list', async () => {
    const content = 'Test Item #1';

    const insertResponse = await insertRecord(content);
    expect(insertResponse.statusCode).toEqual(200);

    const getResponse = await getRecordsPage();
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.data.length).toEqual(1);
    expect(getResponse.body.data[0].id).toEqual(insertResponse.body.id);
    expect(getResponse.body.data[0].content).toEqual(content);
  });

  it('should save and return paged records', async () => {
    const content1 = 'Test Item #1';
    const content2 = 'Test Item #2';

    const insertResponse1 = await insertRecord(content1);
    expect(insertResponse1.statusCode).toEqual(200);
    const insertResponse2 = await insertRecord(content2);
    expect(insertResponse2.statusCode).toEqual(200);

    const getResponse1 = await getRecordsPage(1);
    expect(getResponse1.statusCode).toEqual(200);
    expect(getResponse1.body.data.length).toEqual(1);
    expect(getResponse1.body.data[0].id).toEqual(insertResponse1.body.id);
    expect(getResponse1.body.data[0].content).toEqual(content1);

    const getResponse2 = await getRecordsPage(1, getResponse1.body.nextPageToken);
    expect(getResponse2.statusCode).toEqual(200);
    expect(getResponse2.body.data.length).toEqual(1);
    expect(getResponse2.body.data[0].id).toEqual(insertResponse2.body.id);
    expect(getResponse2.body.data[0].content).toEqual(content2);
  });

  it('should save and return single record', async () => {
    const content = 'Test Item #1';

    const insertResponse = await insertRecord(content);
    expect(insertResponse.statusCode).toEqual(200);

    const getResponse = await getRecord(insertResponse.body.id);
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.id).toEqual(insertResponse.body.id);
    expect(getResponse.body.content).toEqual(content);
  });

  it('should save and update single record', async () => {
    const content = 'Test Item #1';
    const contentUpdated = 'Test Item #1 Updated';

    const insertResponse = await insertRecord(content);
    expect(insertResponse.statusCode).toEqual(200);
    const updateResponse = await updateRecord(insertResponse.body.id, contentUpdated);
    expect(updateResponse.statusCode).toEqual(200);

    const getResponse = await getRecord(insertResponse.body.id);
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.body.id).toEqual(insertResponse.body.id);
    expect(getResponse.body.content).toEqual(contentUpdated);
  });

  it('should save and delete single record', async () => {
    const content = 'Test Item #1';

    const insertResponse = await insertRecord(content);
    expect(insertResponse.statusCode).toEqual(200);
    const deleteResponse = await deleteRecord(insertResponse.body.id);
    expect(deleteResponse.statusCode).toEqual(200);

    const getResponse = await getRecord(insertResponse.body.id);
    expect(getResponse.statusCode).toEqual(404);
    expect(getResponse.body.type).toEqual('ItemNotFound');
  });

  it('should return 404 when getting record with invalid', async () => {
    const response = await getRecord('invalid-id');
    expect(response.statusCode).toEqual(400);
    expect(response.body.type).toEqual('ValidationError');
  });

  it('should return 400 when inserting record with empty content', async () => {
    const response = await insertRecord('');
    expect(response.statusCode).toEqual(400);
    expect(response.body.type).toEqual('ValidationError');
  });

  it('should return 400 when updating record with empty content', async () => {
    const insertResponse = await insertRecord('Content');
    expect(insertResponse.statusCode).toEqual(200);
    const deleteResponse = await updateRecord(insertResponse.body.id, '');
    expect(deleteResponse.statusCode).toEqual(400);
    expect(deleteResponse.body.type).toEqual('ValidationError');
  });

  it('should return 404 when updating record with invalid id', async () => {
    const response = await updateRecord('invalid-id', 'Content');
    expect(response.statusCode).toEqual(400);
    expect(response.body.type).toEqual('ValidationError');
  });

  it('should return 404 when deleting record with invalid id', async () => {
    const response = await deleteRecord('invalid-id');
    expect(response.statusCode).toEqual(400);
    expect(response.body.type).toEqual('ValidationError');
  });

  function getRecordsPage(pageSize?: number, pageToken?: string) {
    return chai.request(app)
      .get('/api/items')
      .query({
        pageSize,
        pageToken
      });
  }

  function getRecord(id: string) {
    return chai.request(app)
      .get(`/api/items/${id}`);
  }

  function insertRecord(content: string) {
    return chai.request(app)
      .post('/api/items')
      .set('Content-Type', 'application/json')
      .send({
        content
      });
  }

  function updateRecord(id: string, content: string) {
    return chai.request(app)
      .put(`/api/items/${id}`)
      .set('Content-Type', 'application/json')
      .send({
        content
      });
  }

  function deleteRecord(id: string) {
    return chai.request(app)
      .delete(`/api/items/${id}`);
  }
});
