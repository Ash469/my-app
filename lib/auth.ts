import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from './constants';

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hashed password
 */
export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d',
    });
}

export function verifyToken(token: string): JWTPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
