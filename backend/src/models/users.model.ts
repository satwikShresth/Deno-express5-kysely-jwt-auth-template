// users.model.ts
import { Static, Type } from '@sinclair/typebox';
import {
   email,
   full_name,
   hashed_password,
   id,
   is_active,
   is_superuser,
   new_password,
   password,
   QuerySkipLimit,
} from 'models/common.model.ts';

export const SuperUserSignup = Type.Object({
   email,
   password,
   full_name: Type.Optional(full_name),
   confirm_password: password,
   is_active,
   is_superuser,
}, {
   additionalProperties: false,
});

export const ModifyInfo = Type.Object({
   full_name,
   email,
});

export const ModifyPassword = Type.Object({
   current_password: password,
   new_password: new_password,
   confirm_password: password,
});

export const QueryUser = QuerySkipLimit;

export const ModifyUser = Type.Object({
   id,
   email,
   is_active,
   is_superuser,
   full_name: Type.Optional(full_name),
   hashed_password,
   password: Type.Optional(password),
   confirm_password: Type.Optional(password),
});

export const UserId = Type.Object({
   id,
});

export const User = Type.Object({
   id,
   email,
   full_name: Type.Optional(full_name),
   hashed_password: Type.Optional(hashed_password),
   is_active,
   is_superuser,
});

export type User = Static<typeof User>;
export type UserId = Static<typeof UserId>;
export type ModifyUser = Static<typeof ModifyUser>;
export type QueryUser = Static<typeof QueryUser>;
export type SuperUserSignup = Static<typeof SuperUserSignup>;
export type ModifyInfo = Static<typeof ModifyInfo>;
export type ModifyPassword = Static<typeof ModifyPassword>;
