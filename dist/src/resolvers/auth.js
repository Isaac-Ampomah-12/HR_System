import yup from "yup";
import bcrypt from "bcryptjs";
export const authResolvers = {
    signup: async (_, { data }, { prisma }) => {
        const { name, email, role, password, departmentId } = data;
        const yupValidator = yup.object({
            name: yup.string().required().max(50).min(1),
            email: yup.string().email(),
            password: yup.string().min(8),
            role: yup.number().max(1),
            departmentId: yup.number()
        });
        // validate data against yup schema
        await yupValidator.validate(data);
        const hashedPassword = bcrypt.hash(password, 10);
        console.log(hashedPassword);
    }
};
