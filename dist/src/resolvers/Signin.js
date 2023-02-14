import yup from "yup";
import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";
import JWT from "jsonwebtoken";
import { JWT_SIGNATURE } from "../keys.js";
export const SigninResolvers = {
    signIn: async (_, { data }, { prisma }) => {
        const { email, password } = data;
        // yup validation schema
        const yupValidator = yup.object({
            email: yup.string().email().required(),
            password: yup.string().min(8).required(),
        });
        // validate data against yup schema
        await yupValidator.validate(data);
        // Check if the email exist in the database
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        // if the email does not exist in database throw an error
        if (!user) {
            return new GraphQLError(`Invalid credentials`);
        }
        // check if password matched the password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        // if the password does not match what is in the database throw an error
        if (!isMatch) {
            return new GraphQLError(`Invalid credentials`);
        }
        // if the email and password match the same user in the database return a JWT token 
        return {
            token: JWT.sign({ userId: user.id }, JWT_SIGNATURE, {
                expiresIn: 360000000
            })
        };
    }
};
