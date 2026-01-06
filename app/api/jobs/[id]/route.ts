import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { authMiddleware, getUserFromRequest, requireRole } from '@/lib/middleware';
import { UserRole } from '@/lib/constants';

// GET /api/jobs/[id] - Get a specific job
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const job = await Job.findById(id).populate('recruiterId', 'firstName lastName company email');

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ job });
    } catch (error) {
        console.error('Get job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/jobs/[id] - Update a job (Recruiter only, own jobs)
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

        const job = await Job.findById(id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Check if user owns this job
        if (job.recruiterId.toString() !== currentUser.userId) {
            return NextResponse.json(
                { error: 'You can only update your own jobs' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const updatedJob = await Job.findByIdAndUpdate(id, body, { new: true });

        return NextResponse.json({
            message: 'Job updated successfully',
            job: updatedJob,
        });
    } catch (error) {
        console.error('Update job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/jobs/[id] - Delete a job (Recruiter only, own jobs)
export async function DELETE(
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

        const job = await Job.findById(id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Check if user owns this job
        if (job.recruiterId.toString() !== currentUser.userId) {
            return NextResponse.json(
                { error: 'You can only delete your own jobs' },
                { status: 403 }
            );
        }

        await Job.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
