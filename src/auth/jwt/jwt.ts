import {config} from '../../config/config';
import jwt from 'jsonwebtoken';

// Function to generate a JWT token for a given phone number
export const generateToken = (
    phoneNumber: string,
) => {
    const token = jwt.sign({ phoneNumber }, config.jwtSecret, { expiresIn: "1h" });
    return token;
}

// Function to verify a given JWT token
export const verifyToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error };
    }
}