import express from 'express';
import request from 'supertest';
import routes from '../routes';

const app = express();
app.use(express.json());
app.use(routes);

describe('GET /ping', () => {
  it('should return 200 and pong', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.text).toBe('pong');
  });
});
