import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from 'db';
import { User, UserUpdate } from 'db/types';
import { JwtPayload } from 'models/auth.model.ts';

export class AuthService {
   private SALT_ROUNDS = <number | undefined> Deno.env.get('SALT_ROUNDS');
   private JWT_SECRET = Deno.env.get('JWT_SECRET');
   private JWT_EXPIRATION = Deno.env.get('JWT_EXPIRATION');

   private async validateUserExists(id: string): Promise<User> {
      const user = await this.findUserById(id);
      if (!user) {
         throw new Error('User not found');
      }
      return user;
   }

   private async validateEmailUnique(
      email: string,
      excludeUserId?: string,
   ): Promise<void> {
      let query = db
         .selectFrom('user')
         .selectAll()
         .where('email', '=', email);

      if (excludeUserId) {
         query = query.where('id', '!=', excludeUserId);
      }

      const existingUser = await query.executeTakeFirst();

      if (existingUser) {
         throw new Error('Email already exists');
      }
   }

   async findUserById(id: string): Promise<User> {
      return await db
         .selectFrom('user')
         .selectAll()
         .where('id', '=', id)
         .executeTakeFirst() as User;
   }

   async queryUsers(skip: number = 0, limit: number = 100) {
      const [users, countResult] = await Promise.all([
         db.selectFrom('user')
            .selectAll()
            .limit(limit)
            .offset(skip)
            .execute(),
         db.selectFrom('user')
            .select(db.fn.count('id').as('count'))
            .executeTakeFirst(),
      ]);

      return {
         data: users,
         count: Number(countResult?.count || 0),
      };
   }

   // User management methods
   async registerUser(
      email: string,
      password: string,
      full_name: string = 'tbd',
      is_active: boolean = false,
      is_superuser: boolean = false,
   ): Promise<User> {
      await this.validateEmailUnique(email);

      const hashed_password = await bcrypt.hash(
         password,
         await bcrypt.genSalt(this.SALT_ROUNDS),
      );

      return await db
         .insertInto('user')
         .values({
            email,
            full_name,
            hashed_password,
            is_active,
            is_superuser,
         })
         .returningAll()
         .executeTakeFirst() as User;
   }

   async updateUser(userId: string, userData: UserUpdate): Promise<User> {
      await this.validateUserExists(userId);

      if (userData.email) {
         await this.validateEmailUnique(userData.email, userId);
      }

      return await db
         .updateTable('user')
         .set(userData)
         .where('id', '=', userId)
         .returningAll()
         .executeTakeFirst() as User;
   }

   async modifyCredentials(
      userId: string,
      currentPassword: string,
      newPassword: string,
   ): Promise<void> {
      const user = await this.validateUserExists(userId);

      if (!user.hashed_password) {
         throw new Error('Password Missing');
      }

      const isValidPassword = await bcrypt.compare(
         currentPassword,
         user.hashed_password,
      );
      if (!isValidPassword) {
         throw new Error('Incorrect password');
      }

      if (currentPassword === newPassword) {
         throw new Error('New password cannot be the same as the current one');
      }

      const hashed_password = await bcrypt.hash(
         newPassword,
         await bcrypt.genSalt(this.SALT_ROUNDS),
      );

      await db
         .updateTable('user')
         .set({ hashed_password })
         .where('id', '=', userId)
         .execute();
   }

   async deleteUser(userId: string): Promise<void> {
      // Validate that the user exists before attempting the deletion
      const userToDelete = await this.validateUserExists(userId);

      if (!userToDelete) {
         throw new Error(`User with ID ${userId} does not exist`);
      }

      // Perform the transaction
      await db.transaction().execute(async (trx) => {
         // Delete all items associated with the user
         await trx
            .deleteFrom('item')
            .where('owner_id', '=', userId)
            .execute();

         // Delete the user from the 'user' table
         await trx
            .deleteFrom('user')
            .where('id', '=', userId)
            .execute();
      });
   }

   // Authentication methods
   async validateUser(email: string, password: string): Promise<User> {
      const user = await db
         .selectFrom('user')
         .selectAll()
         .where('email', '=', email)
         .executeTakeFirst();

      if (!user || !(await bcrypt.compare(password, user.hashed_password))) {
         throw new Error('Invalid credentials');
      }

      return user as User;
   }

   generateToken(user: User): string {
      return jwt.sign(
         {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            //iss: 'example.com', // Issuer (your domain or system)
            iat: Math.floor(Date.now() / 1000), // Issued at
         },
         this.JWT_SECRET,
         { expiresIn: this.JWT_EXPIRATION },
      );
   }

   decodeJwtToken(token: string): JwtPayload {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      return decoded;
   }

   async validateJwtToken(payload: JwtPayload): Promise<User> {
      const user = await db
         .selectFrom('user')
         .select(['id', 'email', 'is_active', 'full_name', 'is_superuser'])
         .where('id', '=', payload.id)
         .executeTakeFirst();

      if (!user) {
         throw new Error('User not found');
      }

      if (user.email !== payload.email) {
         throw new Error('Email mismatch');
      }

      if (user.is_active !== payload.is_active) {
         throw new Error('Account status mismatch');
      }

      return user as User;
   }
}
export const authService = new AuthService();
