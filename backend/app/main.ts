import express from 'express';
import * as path from '@std/path';
import { authRoutes } from './routes/auth/auth.routes.ts';
import { protectedRoutes } from './routes/protected/protected.routes.ts';
import cors from 'cors';
import { CONFIG } from './config.ts';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(Deno.cwd(), 'public')));

app.get('/', (req, res) => {
   res.sendFile(path.join(Deno.cwd(), 'public', 'index.html'));
});

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

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
