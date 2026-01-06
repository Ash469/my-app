import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Referee from '@/models/Referee';
import Job from '@/models/Job';
import User from '@/models/User';
import { authMiddleware, getUserFromRequest, requireRole } from '@/lib/middleware';
import { UserRole, ApplicationStatus } from '@/lib/constants';
import { sendApplicationStatusUpdate } from '@/lib/email';
import { z } from 'zod';

// GET /api/applications/[id] - Get a specific application
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

        const application = await Application.findById(id)
            .populate('jobId')
            .populate('employeeId', '-passwordHash');

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Fetch referees
        const referees = await Referee.find({ applicationId: id });

        // Check access permissions
        if (currentUser.role === UserRole.EMPLOYEE) {
            // Employees can only view their own applications
            if (application.employeeId._id.toString() !== currentUser.userId) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }

            // Remove internal notes for employees
            const sanitizedApplication = application.toObject();
            delete sanitizedApplication.internalNotes;

            return NextResponse.json({
                application: {
                    ...sanitizedApplication,
                    referees,
                },
            });
        } else if (currentUser.role === UserRole.RECRUITER) {
            // Recruiters can only view applications for their jobs
            const job = await Job.findById(application.jobId);
            if (!job || job.recruiterId.toString() !== currentUser.userId) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }

            return NextResponse.json({
                application: {
                    ...application.toObject(),
                    referees,
                },
            });
        }

        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    } catch (error) {
        console.error('Get application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

const updateStatusSchema = z.object({
    status: z.nativeEnum(ApplicationStatus),
    feedback: z.string().max(500).optional(),
    internalNotes: z.string().optional(),
});

// PATCH /api/applications/[id] - Update application status (Recruiter only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const roleError = await requireRole(UserRole.RECRUITER)(request);
    if (roleError) return roleError;

    try {
        await dbConnect();
        const { id } = await params;

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const application = await Application.findById(id).populate('jobId').populate('employeeId');
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Check if recruiter owns the job
        const job = await Job.findById(application.jobId);
        if (!job || job.recruiterId.toString() !== currentUser.userId) {
            return NextResponse.json(
                { error: 'You can only update applications for your own jobs' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = updateStatusSchema.parse(body);

        // Update application
        application.status = validatedData.status;
        if (validatedData.feedback) {
            application.feedback = validatedData.feedback;
        }
        if (validatedData.internalNotes) {
            application.internalNotes = validatedData.internalNotes;
        }

        await application.save();

        // Send email notification to employee
        const employee = await User.findById(application.employeeId);
        if (employee) {
            await sendApplicationStatusUpdate(
                employee.email,
                `${employee.firstName} ${employee.lastName}`,
                job.title,
                validatedData.status,
                validatedData.feedback
            );
        }

        return NextResponse.json({
            message: 'Application status updated successfully',
            application,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Update application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
