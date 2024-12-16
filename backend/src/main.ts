import { Context, Hono } from '@hono/hono';
import { cors } from '@hono/hono/cors';
import { prettyJSON } from '@hono/hono/pretty-json';
import { logger } from '@hono/hono/logger';
import apiV1Routes from 'routes/mod.ts';
import { openAPISpecs } from 'hono-openapi';
import { apiReference } from '@scalar/hono-api-reference';
//import { swaggerUI } from '@hono/swagger-ui';

// Environment configuration
const PORT = parseInt(Deno.env.get('PORT') || '3000');
const ENV = Deno.env.get('ENV') || 'development';

// Custom logger function for additional logging
const customLogger = (message: string, ...rest: string[]) => {
   console.log(message, ...rest);
};

// Error response formatter
const formatErrorResponse = (error: Error, includeStack = false) => ({
   message: error.message,
   ...(includeStack && { stack: error.stack }),
});

// Initialize Hono app
const app = new Hono()
   .use('*', logger(customLogger))
   .use('*', cors())
   .use('*', prettyJSON())
   .route('/api/v1', apiV1Routes());

app.get(
   '/openapi',
   openAPISpecs(app, {
      documentation: {
         info: {
            title: 'Inspiration API',
            version: '1.0.0',
            description: 'API for all the interaction from backend',
         },
         servers: [{
            url: 'http://localhost:3000',
            description: 'Local Server',
         }],
         components: {
            securitySchemes: {
               bearerAuth: {
                  type: 'oauth2',
                  description: 'Login in to access protected-routes',
                  flows: {
                     password: {
                        tokenUrl: 'api/v1/login/access-token',
                        scoped: {},
                     },
                  },
                  'x-tokenName': 'access_token',
                  'x-tokenType': 'bearer',
               },
            },
         },
      },
   }),
);

app.get(
   '/docs',
   apiReference({
      theme: 'saturn',
      spec: { url: '/openapi' },
   }),
);

//app.get(
//   '/docs',
//   swaggerUI({
//      url: '/openapi',
//   }),
//);

app.notFound((c) => {
   const error = new Error(`Not Found: ${c.req.url}`);
   customLogger('Not Found:', c.req.url);
   return c.json(formatErrorResponse(error, ENV === 'development'), 404);
});

app.onError((err: Error, c: Context): Response => {
   let status = c.res.status !== 200 ? c.res.status : 500;

   if (err instanceof URIError) {
      status = 400;
   } else if (err instanceof TypeError) {
      status = 422;
   }

   customLogger('Error:', err.message, `Status: ${status}`);
   const response = formatErrorResponse(err, ENV === 'development');
   return c.json(response, { status });
});

addEventListener('unhandledrejection', (event) => {
   customLogger('Unhandled Promise Rejection:', event.reason);
});

try {
   Deno.serve({
      port: PORT,
      onError: (error) => {
         customLogger('Server Error:', error.message);
         return new Response('Internal Server Error', { status: 500 });
      },
   }, app.fetch);

   console.info(`🚀 Server running on http://localhost:${PORT}`);
   console.info(`✨ Environment: ${ENV}`);
} catch (error) {
   customLogger('Failed to start server:', error.message);
   Deno.exit(1);
}

