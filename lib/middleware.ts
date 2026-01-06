import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '@/lib/auth';
import { UserRole } from '@/lib/constants';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

// Cache for storing authenticated user data per request
const authCache = new Map<NextRequest, JWTPayload>();

/**
 * Middleware to verify JWT token and store user data
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const payload = verifyToken(token);
        // Store user data in cache
        authCache.set(request, payload);
        return null; // Continue to handler
    } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(...roles: UserRole[]) {
    return async (request: NextRequest): Promise<NextResponse | null> => {
        const user = authCache.get(request);
        const userRole = user?.role;

        console.log('Role check:', { userRole, requiredRoles: roles, match: userRole ? roles.includes(userRole) : false });

        if (!userRole || !roles.includes(userRole)) {
            return NextResponse.json(
                { error: 'Insufficient permissions', userRole, requiredRoles: roles },
                { status: 403 }
            );
        }

        return null; // Continue to handler
    };
}

/**
 * Helper to get user from request
 */
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
    return authCache.get(request) || null;
}
