import express from 'express';
import * as path from '@std/path';
import cors from 'cors';
import { CONFIG } from './config.ts';
import { db } from 'db';
import configureRouters from 'routes/mod.ts';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(Deno.cwd(), 'public')));

app.get('/', (req, res) => {
   res.sendFile(path.join(Deno.cwd(), 'public', 'index.html'));
});

configureRouters(app);

app.use(
   (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
   ) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
   },
);

// Start server
app.listen(CONFIG.PORT, () => {
   console.log(`Server running on port ${CONFIG.PORT}`);
});
