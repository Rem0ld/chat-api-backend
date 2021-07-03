import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Context } from "../config/context";
import { APP_SECRET, getUserId } from "../config/auth.config";
import { dateScalar } from "./schemas/Schema";

export const resolvers = {
  Date: dateScalar,
  Query: {
    // Returns all user in DB
    users: (_parent: any, _args: null, context: Context) => {
      return context.prisma.user.findMany();
    },
    // Returns one user from id
    user: (_parent: any, args: { id: string }, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: +args.id },
      });
    },
    // Returns myself
    me: (_parent: any, _args: null, context: Context) => {
      const userId = getUserId(context);
      if (!userId) throw new Error("No id provided");

      return context.prisma.user.findUnique({
        where: { id: +userId },
      });
    },
  },
  Mutation: {
    // Will create a user
    signup: async (
      _parent: any,
      args: { email: string; username: string; password: string },
      context: Context
    ) => {
      const hashedPassword = await hash(args.password, 10);
      const user = await context.prisma.user.create({
        data: {
          username: args.username,
          email: args.email,
          password_hash: hashedPassword,
        },
      });
      return {
        token: sign({ userId: user.id }, APP_SECRET),
        user,
      };
    },
    // Log user if exist and password is correct
    login: async (
      _parent: any,
      args: { username: string; password: string },
      context: Context
    ) => {
      const user = await context.prisma.user.findUnique({
        where: {
          username: args.username,
        },
      });
      if (!user) throw new Error(`No user found for this email: ${args.username}`);

      const passwordValid = await compare(args.password, user.password_hash);
      if (!passwordValid) throw new Error("Invalid password");

      return {
        token: sign({ userId: user.id }, APP_SECRET),
        user,
      };
    },
  },
};