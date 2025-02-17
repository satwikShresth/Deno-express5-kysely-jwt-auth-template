import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { and, count, eq, ne } from 'drizzle-orm';
import { db } from 'db';
import { items, users, type UserSchema } from 'db/types';
import { User } from 'models/users.model.ts';
import { JwtPayload } from 'models/auth.model.ts';

export class AuthService {
   private SALT_ROUNDS = Number(Deno.env.get('SALT_ROUNDS'));
   private JWT_SECRET = Deno.env.get('JWT_SECRET') as string;
   private JWT_EXPIRATION = Deno.env.get('JWT_EXPIRATION');

   private async validateUserExists(id: string): Promise<UserSchema> {
      const user = await this.findUserById(id);
      if (!user) {
         throw new Error('User not found');
      }
      return user;
   }

   private async validateEmailUnique(
      email: string,
      exclude_user_id?: string,
   ): Promise<void> {
      const query = exclude_user_id
         ? and(eq(users.email, email), ne(users.id, exclude_user_id))
         : eq(users.email, email);

      const existing_user = await db
         .select()
         .from(users)
         .where(query)
         .limit(1);

      if (existing_user.length > 0) {
         throw new Error('Email already exists');
      }
   }

   async findUserById(id: string): Promise<UserSchema | undefined> {
      const result = await db
         .select()
         .from(users)
         .where(eq(users.id, id))
         .limit(1);

      return result[0];
   }

   async queryUsers(skip: number = 0, limit: number = 100) {
      const [users_data, count_result] = await Promise.all([
         db
            .select()
            .from(users)
            .limit(limit)
            .offset(skip),
         db
            .select({ count: count(users.id) })
            .from(users),
      ]);

      return {
         data: users_data,
         count: Number(count_result[0]?.count || 0),
      };
   }

   async registerUser(
      email: string,
      password: string,
      full_name: string = 'tbd',
      is_active: boolean = false,
      is_superuser: boolean = false,
   ): Promise<UserSchema> {
      await this.validateEmailUnique(email);

      const hashed_password = await bcrypt.hash(
         password,
         await bcrypt.genSalt(this.SALT_ROUNDS),
      );

      const result = await db
         .insert(users)
         .values({
            email,
            full_name,
            hashed_password,
            is_active,
            is_superuser,
         })
         .returning();

      return result[0];
   }

   async updateUser(
      user_id: string,
      user_data,
   ): Promise<UserSchema> {
      await this.validateUserExists(user_id);

      if (user_data.email) {
         await this.validateEmailUnique(user_data.email, user_id);
      }

      const result = await db
         .update(users)
         .set(user_data)
         .where(eq(users.id, user_id))
         .returning();

      return result[0];
   }

   async modifyCredentials(
      user_id: string,
      current_password: string,
      new_password: string,
   ): Promise<void> {
      const user = await this.validateUserExists(user_id);

      if (!user.hashed_password) {
         throw new Error('Password Missing');
      }

      const is_valid_password = await bcrypt.compare(
         current_password,
         user.hashed_password,
      );

      if (!is_valid_password) {
         throw new Error('Incorrect password');
      }

      if (current_password === new_password) {
         throw new Error('New password cannot be the same as the current one');
      }

      const hashed_password = await bcrypt.hash(
         new_password,
         await bcrypt.genSalt(this.SALT_ROUNDS),
      );

      await db
         .update(users)
         .set({ hashed_password })
         .where(eq(users.id, user_id));
   }

   async deleteUser(user_id: string): Promise<void> {
      await this.validateUserExists(user_id);

      await db.transaction(async (trx) => {
         // Delete all items associated with the user
         await trx
            .delete(items)
            .where(eq(items.owner_id, user_id));

         // Delete the user
         await trx
            .delete(users)
            .where(eq(users.id, user_id));
      });
   }

   async validateUser(email: string, password: string): Promise<UserSchema> {
      const result = await db
         .select()
         .from(users)
         .where(eq(users.email, email))
         .limit(1);

      const user = result[0];

      if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
         throw new Error('Invalid credentials');
      }

      return user;
   }

   generateToken(user: User): string {
      return jwt.sign(
         {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            full_name: user.full_name,
            iat: Math.floor(Date.now() / 1000),
         },
         this.JWT_SECRET,
         { expiresIn: this.JWT_EXPIRATION },
      );
   }

   decodeJwtToken(token: string): JwtPayload {
      return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
   }

   async validateJwtToken(payload: JwtPayload): Promise<User> {
      const result = await db
         .select({
            id: users.id,
            email: users.email,
            is_active: users.is_active,
            full_name: users.full_name,
            is_superuser: users.is_superuser,
         })
         .from(users)
         .where(eq(users.id, payload.id))
         .limit(1);

      const user = result[0];

      if (!user) {
         throw new Error('User not found');
      }

      if (user.email !== payload.email) {
         throw new Error('Email mismatch');
      }

      if (user.is_active !== payload.is_active) {
         throw new Error('Account status mismatch');
      }

      return user;
   }
}

export const authService = new AuthService();
