import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import {PrismaClient, Prisma} from "@prisma/client"

// import schema
import { loadSchemaSync } from "@graphql-tools/load"
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader"

const typeDefs = loadSchemaSync("./schema.graphql", {
    loaders: [new GraphQLFileLoader()],
});

import {QueryResolvers, Mutation} from "./src/resolvers/index.js";
import { getUserFromToken } from './src/utils/getUserFromToken.js';

const Query = QueryResolvers.Query;
const prisma = new PrismaClient()

export interface Context {
  prisma?: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;
  userInfo: {
    userId: number,
    // iat: number,
    // exp: number
  } | null
}

const app = express();
const httpServer = http.createServer(app);

// Set up Apollo Server
export const server = new ApolloServer<Context>({
  typeDefs,
  resolvers: {
    Query,
    Mutation
  },
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({req}: any): Promise<Context> => {

      const userInfo = getUserFromToken(req.headers.authorization)
      
       return {
        prisma,
        userInfo
      }
      
    }
  }),
);

await new Promise((resolve: any) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000`);