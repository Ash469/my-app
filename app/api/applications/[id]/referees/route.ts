import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Referee from '@/models/Referee';
import { authMiddleware, getUserFromRequest } from '@/lib/middleware';
import { z } from 'zod';
import { REFEREE_RELATIONSHIPS } from '@/lib/constants';

const addRefereeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    relationship: z.enum(REFEREE_RELATIONSHIPS as any),
    company: z.string().optional(),
    position: z.string().optional(),
});

// GET /api/applications/[id]/referees - Get referees for an application
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        await dbConnect();
        const { id } = await params;

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const application = await Application.findById(id);
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const referees = await Referee.find({ applicationId: id });

        return NextResponse.json({ referees });
    } catch (error) {
        console.error('Get referees error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/applications/[id]/referees - Add a referee to an application
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        await dbConnect();
        const { id } = await params;

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const application = await Application.findById(id);
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Check if user owns this application
        if (application.employeeId.toString() !== currentUser.userId) {
            return NextResponse.json(
                { error: 'You can only add referees to your own applications' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = addRefereeSchema.parse(body);

        const referee = await Referee.create({
            ...validatedData,
            applicationId: id,
        });

        return NextResponse.json(
            {
                message: 'Referee added successfully',
                referee,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Add referee error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
