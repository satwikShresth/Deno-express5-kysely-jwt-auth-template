import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JwtPayload, User, UserInput } from 'app/types';
import { db } from 'db';
import type { NewUser } from 'database/types/user.ts';

export class AuthService {
   SALT_ROUNDS = <number | undefined> Deno.env.get('SALT_ROUNDS');
   JWT_SECRET = Deno.env.get('JWT_SECRET');
   JWT_EXPIRATION = Deno.env.get('JWT_EXPIRATION');

   async registerUser(
      email: string,
      password: string,
      full_name: string,
   ): Promise<User> {
      const existingUser = await db
         .selectFrom('user')
         .selectAll()
         .where('email', '=', email)
         .executeTakeFirst();

      if (existingUser) {
         throw new Error('Email already exists');
      }

      const hashed_password = await bcrypt.hash(
         password,
         await bcrypt.genSalt(this.SALT_ROUNDS),
      );

      return await db
         .insertInto('user')
         .values({
            email: email,
            full_name: full_name,
            hashed_password,
            is_active: true,
            is_superuser: false,
         })
         .returningAll()
         .executeTakeFirst();
   }

   async validateUser(email: string, password: string): Promise<User> {
      const user = await db
         .selectFrom('user')
         .selectAll()
         .where('email', '=', email)
         .executeTakeFirst();

      if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
         throw new Error('Invalid credentials');
      }

      return user;
   }

   generateToken(user: User): string {
      return jwt.sign(
         { id: user.id },
         this.JWT_SECRET,
         { expiresIn: this.JWT_EXPIRATION },
      );
   }
}

export const authService = new AuthService();
