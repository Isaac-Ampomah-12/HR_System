import { Context } from "../../server.js";
import yup, { string } from "yup";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import {JWT_SIGNATURE}from "../keys.js"
import { GraphQLError } from "graphql";

interface departmentArgs {
    data: {
        id: number
        name: string
    }
}

export const departmentResolvers = {
    departmentCreate: async (_: any, {data}: departmentArgs, {prisma, userInfo}:Context) => {
        console.log("here")
        // check if user is logged in
        if(!userInfo){
            return new GraphQLError(`You are not logged in`)
        }

        // destracture the user input
        const {name} = data;
    
        // check if user exists
        const checkUser = await prisma.user.findUnique({
            where: {
                id: Number(userInfo.userId)
            }
        })

        // check if user is an admin
        if(checkUser.role === 1){
            // create department
            return await prisma.department.create({
                data: {
                    name
                }
            });
        }else{
            return new GraphQLError(`Forbidden access`)
        }
    },
}