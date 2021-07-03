import { rule, shield } from "graphql-shield";
import { getUserId } from "../auth.config";
import { Context } from "../context";


const rules = {
  isAuthenticatedUser: rule()((_parent, _args, context: Context) => {
    const userId = getUserId(context)
    return Boolean(userId)
  })
}

export const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser,
  },
  Mutation: {

  }
})