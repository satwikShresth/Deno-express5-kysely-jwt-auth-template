import express, { NextFunction, Request, Response } from 'express';
import morgan, { TokenIndexer } from 'morgan';
import chalk from 'npm:chalk';
import cors from 'cors';
import apiV1Routes from 'routes/mod.ts';

const app = express();
const PORT = Deno.env.get('PORT') || 3000;
const ENV = Deno.env.get('ENV') || 'development';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// Conditionally setup logging based on ENV
if (ENV === 'development') {
   app.use(
      morgan((tokens: TokenIndexer, req: Request, res: Response) => {
         const status = parseInt(tokens.status(req, res) || '500', 10);
         const color = status >= 500
            ? chalk.red
            : status >= 400
            ? chalk.yellow
            : chalk.green;
         const symbol = status >= 400 ? '✗' : '✓';

         // Explicitly get the response time or fallback to `0.0`
         const responseTime = tokens['response-time'](req, res) || '0.0';

         return color(
            `${symbol} ${tokens.method(req, res)} ${
               tokens.url(req, res)
            } [${status}] ${responseTime}ms`,
         );
      }),
   );
   console.log(chalk.blue('Logging enabled for development environment.'));
}

app.use('/api/v1', apiV1Routes());

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
   const error = new Error(`Not Found: ${req.originalUrl}`);
   res.status(404);
   next(error);
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
   const status = res.statusCode !== 200 ? res.statusCode : 500;

   console.error(chalk.red(`Error: ${error.message}`));

   res.status(status).json({
      message: error.message,
      stack: ENV === 'development' ? error.stack : undefined,
   });
});

app.listen(PORT, () => {
   console.log(
      chalk.blue(`
🚀 Server running on http://localhost:${PORT}
✨ Environment: ${ENV}
      `),
   );
});
