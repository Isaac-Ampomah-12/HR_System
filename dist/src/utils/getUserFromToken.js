import JWT from "jsonwebtoken";
import { JWT_SIGNATURE } from "../keys.js";
export const getUserFromToken = (token) => {
    try {
        return JWT.verify(token, JWT_SIGNATURE);
    }
    catch (error) {
        return null;
    }
};
