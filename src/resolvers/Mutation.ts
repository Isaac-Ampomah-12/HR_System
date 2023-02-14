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
interface userArgs{
    data: {
        name: string
        email: string
        role: number
        password: string
        departmentId: number
    }
}

interface signinArgs{
    data: {
        email: string
        password: string
    }
}

export const Mutation = {
    departmentCreate: async (_: any, {data}: departmentArgs, {prisma, userInfo}:Context) => {
        // check if user is logged in
        if(!userInfo){
            return new GraphQLError(`You are not logged in`)
        }

        // destracture the user input
        const {name} = data;
    
        // get logged in user information
        const checkUser = await prisma.user.findUnique({
            where: {
                id: Number(userInfo.userId)
            }
        })

        // check if user is an admin
        if(checkUser.role === 1){

            // check if the department name already exists
            const checkDepartmant = await prisma.user.findMany({
                where: {
                    name
                }
            })

            console.log(checkDepartmant);

            // check if name does not exist
            if(checkDepartmant.length === 0){
                // create department
                return await prisma.department.create({
                    data: {
                        name
                    }
                });
            } else{
                return new GraphQLError(`Name already taken`)
            }
        }else{
            return new GraphQLError(`Forbidden access`)
        }
    },

    userCreate: async (_: any, {data}: userArgs, {prisma, userInfo}:Context) => {
        try{

            // check if user is logged in
            if(!userInfo){
                return new GraphQLError(`You are not logged in`)
            }

            // destracture user input
            const {name, email, role, password, departmentId} = data;

            // yup validation schema
            const yupValidator = yup.object({
                name: yup.string().required().max(50).min(1),
                email: yup.string().email().required(),
                password: yup.string().min(8).required(),
                role: yup.number().max(1).required(),
                departmentId: yup.number().required()
            })

            // validate data against yup schema
            await yupValidator.validate(data);

            // check if the user exists
            const checkUser = await prisma.user.findUnique({
                where: {
                    id: Number(userInfo.userId)
                }
            })

             // check if the user is an employee who does not belong to this department
             if(checkUser.role === 0 ){
                return new GraphQLError(`Forbidden access`);
            }

            // check if the user being created already exists
            const checkNewUser = await prisma.user.findUnique({
                where: {
                    email
                }
            })


            if(!checkNewUser){
                // has password
                const hashedPassword = await bcrypt.hash(password, 10);

                // create user
                return await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role,
                        departmentId,
                    },

                    include: {
                        department: true
                    }
                })
            }else{
                return new GraphQLError(`User already exist`)
            }

        }catch(error){
            return error
        }
    },
    
    signIn: async(_: any, {data}: signinArgs, {prisma}:Context) => {
        const {email, password} = data;

        // yup validation schema
        const yupValidator = yup.object({
            email: yup.string().email().required(),
            password: yup.string().min(8).required(),

        })

        // validate data against yup schema
        await yupValidator.validate(data);
        
        // Check if the email exist in the database
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        
        // if the email does not exist in database throw an error
        if(!user){
            return new GraphQLError(`Invalid credentials`)
        }

        // check if password matched the password in the database
        const isMatch = await bcrypt.compare(password, user.password)

        // if the password does not match what is in the database throw an error
        if(!isMatch){
            return new GraphQLError(`Invalid credentials`)
        }

        // if the email and password match the same user in the database return a JWT token 
        return {
            token: JWT.sign({userId: user.id}, JWT_SIGNATURE, {
                expiresIn: 360000000
            })
        }
    }
}