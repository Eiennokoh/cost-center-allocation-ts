import { createServer } from 'node:http';
import { createApi } from './schema';

const port = Number(process.env.PORT ?? 4000);
const server = createServer(createApi());

server.listen(port, () => {
  console.log(`GraphQL API: http://localhost:${port}/graphql`);
});
