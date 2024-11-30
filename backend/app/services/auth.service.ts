import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config.ts';
import { JwtPayload, User, UserInput } from 'app/types';
import { db } from 'db';
import type { NewUser } from 'database/types/user.ts';

export class AuthService {
   async registerUser(userInput: NewUser): Promise<User> {
      const existingUser = await db
         .selectFrom('user')
         .selectAll()
         .where('email', '=', userInput.email)
         .executeTakeFirst();

      if (existingUser) {
         throw new Error('Email already exists');
      }

      const hashed_password = await bcrypt.hash(
         userInput.password,
         await bcrypt.genSalt(CONFIG.SALT_ROUNDS),
      );

      return await db
         .insertInto('user')
         .values({
            email: userInput.email,
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
         CONFIG.JWT_SECRET,
         { expiresIn: CONFIG.JWT_EXPIRATION },
      );
   }
}

export const authService = new AuthService();
