import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Shop API listening on port ${env.PORT}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => pool.end().finally(() => process.exit(0)));
  });
}
