import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config.ts';
import { JwtPayload, User, UserInput } from 'app/types';

class AuthService {
   private users: User[] = [];

   async registerUser(userInput: UserInput): Promise<User> {
      const existingUser = this.users.find((u) =>
         u.username === userInput.username
      );
      if (existingUser) {
         throw new Error('Username already exists');
      }

      const salt = await bcrypt.genSalt(CONFIG.SALT_ROUNDS); // Using Deno bcrypt
      const hashedPassword = await bcrypt.hash(
         userInput.password,
         salt,
      );

      const newUser: User = {
         id: this.users.length + 1,
         username: userInput.username,
         password: hashedPassword,
      };

      this.users.push(newUser);
      return newUser;
   }

   async validateUser(userInput: UserInput): Promise<User> {
      const user = this.users.find((u) => u.username === userInput.username);
      if (!user) {
         throw new Error('Invalid credentials');
      }

      const validPassword = await bcrypt.compare(
         userInput.password,
         user.password,
      );
      if (!validPassword) {
         throw new Error('Invalid credentials');
      }

      return user;
   }

   generateToken(user: User): string {
      const payload: JwtPayload = {
         userId: user.id,
         username: user.username,
      };

      return jwt.sign(payload, CONFIG.JWT_SECRET, {
         expiresIn: CONFIG.JWT_EXPIRATION,
      });
   }
}

export const authService = new AuthService();
