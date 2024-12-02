import express from 'express';
import morgan from 'morgan';
import chalk from 'chalk'; // For colored console output
import * as path from '@std/path';
import cors from 'cors';
import configureRouters from 'routes/mod.ts';

const app = express();
const PORT = Deno.env.get('PORT');

// Custom morgan tokens
morgan.token('error-message', (req: Request, res: Response) => {
   return res.locals.errorMessage || '';
});

morgan.token('client-ip', (req: Request) => {
   return req.ip || req.socket.remoteAddress || '';
});

// Success logging
app.use(express.urlencoded({ extended: true }));
app.use(
   morgan(chalk.green(':client-ip :method :url :status :response-time ms')),
);
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
      console.error(err);
      res.status(500).json({ message: 'Something went wrong!' });
   },
);

app.use(
   (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
   ) => {
      const error = new Error(`Route not found: ${req.originalUrl}`);
      res.locals.errorMessage = error.message;
      res.status(404);
      next(error);
   },
);

app.use(
   (
      error: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
   ) => {
      const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
      const logMessage =
         `❌ ${req.ip} ${req.method} ${req.originalUrl} ${statusCode} - ${error.message}`;

      // Log error in red
      console.log(chalk.red(logMessage));

      res.status(statusCode).json({
         message: error.message,
         stack: process.env.NODE_ENV === 'development' ? error.stack : '🥞',
      });
   },
);

app.listen(PORT, () => {
   console.log(chalk.blue(`🚀 Server started on port ${PORT}`));
});
