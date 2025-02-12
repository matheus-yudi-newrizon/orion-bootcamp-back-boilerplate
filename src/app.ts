import 'reflect-metadata';

import cors from 'cors';
import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import { MysqlDataSource } from './config/database';
import { swaggerConfig } from './config/swagger';
import routes from './routes';
import cookieParser from 'cookie-parser';

MysqlDataSource.initialize()
  .then(() => {
    console.log('Database initialized!');
  })
  .catch(err => {
    console.error('Database Error: ', err);
  });

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(routes);
app.use('/coverage', express.static(__dirname + '/../coverage/lcov-report'));

const swaggerSpec = swaggerJSDoc(swaggerConfig);

app.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.get('/swagger.json', (_req, res) => res.send(swaggerSpec));

console.log('Add swagger on /swagger');

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server listening on port ${process.env.SERVER_PORT}`);
});
