
export const host = Deno.env.get('ENV')
   ? Deno.env.get('POSTGRES_SERVER')
   : 'localhost';
export const database = Deno.env.get('POSTGRES_DB');
export const port = Deno.env.get('POSTGRES_PORT');
export const user = Deno.env.get('POSTGRES_USER');
export const password = Deno.env.get('POSTGRES_PASSWORD');
export const min = 2;
export const max = 10;
