import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '@/lib/auth';
import { UserRole } from '@/lib/constants';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

const authCache = new Map<NextRequest, JWTPayload>();
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const payload = verifyToken(token);
        authCache.set(request, payload);
        return null;
    } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}


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

        return null;
    };
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
    return authCache.get(request) || null;
}

