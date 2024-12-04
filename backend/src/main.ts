import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import chalk from 'chalk';
import * as path from '@std/path';
import cors from 'cors';
import apiV1Routes from 'routes/mod.ts';

const app = express();
const PORT = Deno.env.get('PORT');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// Custom logging middleware inspired by FastAPI
app.use((req: Request, res: Response, next: NextFunction) => {
   const start = Date.now();
   res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const color = status >= 500 ? 'red' : status >= 400 ? 'yellow' : 'green';
      const symbol = status >= 400 ? '✗' : '✓';

      console.log(
         chalk[color](
            `${symbol} ${req.method} ${req.originalUrl} [${status}] ${duration}ms`,
         ),
      );
   });
   next();
});

// Routes
app.get('/', (req, res) => {
   res.sendFile('public/index.html');
});

app.use('/api/v1', apiV1Routes());

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
   const error = new Error(`Not Found: ${req.originalUrl}`);
   res.status(404);
   next(error);
});

app.use(
   (
      error: Error,
      req: Request,
      res: Response,
      next: NextFunction,
   ) => {
      const status = res.statusCode !== 200 ? res.statusCode : 500;

      console.error(chalk.red(`Error: ${error.message}`));

      res.status(status).json({
         message: error.message,
         stack: Deno.env.get('ENV') === 'development' ? error.stack : undefined,
      });
   },
);

// Start server
app.listen(PORT, () => {
   console.log(chalk.blue(`
🚀 Server running on http://localhost:${PORT}
✨ Environment: ${Deno.env.get('ENV') || 'development'}
  `));
});
