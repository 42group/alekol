import { Router } from 'express';

const route = Router();

route.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

export default route;
