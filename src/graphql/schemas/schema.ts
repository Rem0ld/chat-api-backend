import { gql } from "apollo-server-express";
import { GraphQLScalarType, Kind } from "graphql";

export const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: Date) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value: number) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});


export const typeDefs = gql`
scalar Date

type Auth {
  token: String
  user: User
}

type User {
  id: ID!
  created_at: Date
  updated_at: Date
  username: String!
  email: String!
  password_hash: String
  message: [Message]
  inChannel: [UserInChannel]
  isOwner: [Channel]
}

type Message {
  id: ID!
  created_at: Date
  updated_at: Date
  content: String!
  channel: Channel
  author: User
}

type UserInChannel {
  id: ID!
  created_at: Date
  updated_at: Date
  user: [User]
  channel: [Channel]
}

type Channel {
  id: ID!
  created_at: Date
  updated_at: Date
  name: String!
  owner: User
  message: [Message]
  userInChannel: [UserInChannel]
}

type Query {
  users: [User]!
  user(id: ID!): User
  me: User
}

type Mutation {
  signup(email: String!, username: String!, password: String!): Auth
  login(username: String!, password: String!): Auth
}
`