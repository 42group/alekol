import express from 'express';
import routes from './routes';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const global_prefix = process.env.GLOBAL_PREFIX ?? 'api';

const app = express();
app.use(`/${global_prefix}`, routes);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}/${global_prefix}`);
});
