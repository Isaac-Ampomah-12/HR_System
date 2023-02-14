import { GraphQLError } from "graphql";
export const QueryResolvers = {
    Query: {
        departments: async (_, __, { prisma, userInfo }) => {
            // check if user is logged in
            if (!userInfo) {
                return new GraphQLError(`You are not logged in`);
            }
            // check if the user exists
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            });
            // check if the user is an admin
            if (checkUser.role === 1) {
                return await prisma.department.findMany({
                    orderBy: {
                        id: "desc"
                    },
                    include: {
                        users: true
                    }
                });
            }
            else {
                return new GraphQLError(`Forbidden access`);
            }
        },
        department: async (_, { id }, { prisma, userInfo }) => {
            // check if user is logged in
            if (!userInfo) {
                return new GraphQLError(`You are not logged in`);
            }
            // check if the user exists
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            });
            // check if the user is an employee who does not belong to this department
            if (checkUser.role === 0 && checkUser.departmentId !== Number(id)) {
                return new GraphQLError(`Forbidden access`);
            }
            // return the department details
            return await prisma.department.findUnique({
                where: {
                    id: Number(id)
                },
                include: {
                    users: true
                },
            });
        },
        users: async (_, __, { prisma, userInfo }) => {
            // check if user is logged in
            if (!userInfo) {
                return new GraphQLError(`You are not logged in`);
            }
            // check if user exists
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            });
            // check if user is an admin
            if (checkUser.role !== 1) {
                return new GraphQLError(`Forbidden access`);
            }
            // return all users 
            return await prisma.user.findMany({
                orderBy: {
                    id: "desc"
                },
                include: {
                    department: true
                }
            });
        },
        user: async (_, { id }, { prisma, userInfo }) => {
            // check if user is logged in
            if (!userInfo) {
                return new GraphQLError(`You are not logged in`);
            }
            // check if user exists
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            });
            // check if the user is an employee that wants to view a different user
            if (checkUser.role === 0 && checkUser.id !== Number(id)) {
                return new GraphQLError(`Forbidden access`);
            }
            // return the user details
            return await prisma.user.findUnique({
                where: {
                    id: Number(id)
                },
                include: {
                    department: true
                }
            });
        }
    },
    Department: {
        users: (parent, __, { prisma }) => {
            console.log(parent);
        }
    }
};
