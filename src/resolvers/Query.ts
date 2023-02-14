import { Context } from "../../server.js";
import { GraphQLError } from "graphql";
interface DepartmentArgs{
    data: {
        id: number
    }
}

interface UserArgs{
    data: {
        id: number
    }
}

export const QueryResolvers = {
    Query: {
        
        departments: async(_: any, __: any, {prisma, userInfo}: Context) => {
            // check if user is logged in
            if(!userInfo){
                return new GraphQLError(`You are not logged in`)
            }

            // check if the user exists
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            })
    
            // check if the user is an admin
            if(checkUser.role === 1){
                return await prisma.department.findMany({
                    orderBy: {
                        id: "desc"
                    },
                    include: {
                        users: true
                    }
                });
            }else{
                return new GraphQLError(`Forbidden access`)
            }
        },

        department: async (_: any, {id}: DepartmentArgs["data"], {prisma, userInfo}: Context) => {

            // check if user is logged in
            if(!userInfo){
                return new GraphQLError(`You are not logged in`)
            }

            // check if the user exists
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            })
            
            // check if the user is an employee who does not belong to this department
            if(checkUser.role === 0 && checkUser.departmentId !== Number(id)){
                return new GraphQLError(`Forbidden access`);
            }

            // check if the searched department id exist
            const checkId = await prisma.user.findUnique({
                where: {
                    id: Number(id)
                }
            })

            
            if(checkId){
            // return the department details
                return await prisma.department.findUnique({
                    where: {
                        id: Number(id)
                    },
                    include: {
                        users: true
                    },
                    
                })
            }else {
                return new GraphQLError(`Id does not exist`);
            }
            
        }, 

        users: async (_: any, __: any, {prisma, userInfo}: Context) => {

            // check if user is logged in
            if(!userInfo){
                return new GraphQLError(`You are not logged in`)
            }

            // check if user exists
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            })

            // check if user is an admin
            if(checkUser.role !== 1){
                return new GraphQLError(`Forbidden access`);
            }

            // return all users 
            return await prisma.user.findMany({
                orderBy: {
                    id: "desc"
                },
                include: {
                    department: {
                        include: {
                            users: true
                        }
                    }
                }
            });
        },

        user: async (_: any, {id}: UserArgs["data"], {prisma, userInfo}: Context) => {
            // check if user is logged in
            if(!userInfo){
                return new GraphQLError(`You are not logged in`)
            }

            // get logged in user information
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            })

            // check if the user is an employee that wants to view a different user
            if(checkUser.role === 0 && checkUser.id !== Number(id)){
                return new GraphQLError(`Forbidden access`);
            }

            // check if the searched user exist
            const checkId = await prisma.user.findUnique({
                where: {
                    id: Number(id)
                }
            })

            
            if(checkId){
                return await prisma.user.findUnique({
                    where: {
                        id: Number(id)
                    },
                    include: {
                        // department: true
                        department: {
                            include: {
                                users : true
                            }
                        }
                    }
                });
            } else {
                return new GraphQLError(`Id does not exist`);
            }
        }
    }
}