import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Referee from '@/models/Referee';
import Job from '@/models/Job';
import { authMiddleware, getUserFromRequest, requireRole } from '@/lib/middleware';
import { UserRole, ApplicationStatus } from '@/lib/constants';
import { z } from 'zod';

const refereeSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    relationship: z.string(),
    company: z.string().optional(),
    position: z.string().optional(),
});

const applySchema = z.object({
    resumeUrl: z.string().url('Invalid resume URL'),
    coverLetter: z.string().optional(),
    referees: z.array(refereeSchema).min(1, 'At least one referee is required').max(3, 'Maximum 3 referees allowed'),
});

// POST /api/jobs/[id]/apply - Submit job application with referees (Employee only)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verify authentication
    const authError = await authMiddleware(request);
    if (authError) return authError;

    // Check if user is an employee
    const roleError = await requireRole(UserRole.EMPLOYEE)(request);
    if (roleError) return roleError;

    try {
        await dbConnect();

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify job exists
        const job = await Job.findById(id);
        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({
            jobId: id,
            employeeId: currentUser.userId,
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: 'You have already applied for this job' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = applySchema.parse(body);

        // Create application
        const application = await Application.create({
            jobId: id,
            employeeId: currentUser.userId,
            resumeUrl: validatedData.resumeUrl,
            coverLetter: validatedData.coverLetter,
            status: ApplicationStatus.SUBMITTED,
        });

        // Create referee records
        const refereePromises = validatedData.referees.map(referee =>
            Referee.create({
                applicationId: application._id,
                ...referee,
            })
        );

        await Promise.all(refereePromises);

        return NextResponse.json({
            message: 'Application submitted successfully',
            application,
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Apply to job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
