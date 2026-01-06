import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';

import { authMiddleware, getUserFromRequest, requireRole } from '@/lib/middleware';
import { UserRole, ApplicationStatus } from '@/lib/constants';
import { z } from 'zod';

const createApplicationSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    resumeUrl: z.string().url('Invalid resume URL'),
    coverLetter: z.string().max(2000).optional(),
});

// GET /api/applications - Get applications (filtered by role)
export async function GET(request: NextRequest) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        await dbConnect();

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');
        const status = searchParams.get('status');

        let query: any = {};

        if (currentUser.role === UserRole.EMPLOYEE) {
            // Employees see only their own applications
            query.employeeId = currentUser.userId;
        } else if (currentUser.role === UserRole.RECRUITER) {
            // Recruiters see applications for their jobs
            const recruiterJobs = await Job.find({ recruiterId: currentUser.userId }).select('_id');
            const jobIds = recruiterJobs.map(job => job._id);
            query.jobId = { $in: jobIds };
        }

        if (jobId) {
            query.jobId = jobId;
        }

        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate('jobId', 'title company location')
            .populate('employeeId', 'firstName lastName email phone')
            .sort({ createdAt: -1 });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error('Get applications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/applications - Create a new application (Employee only)
export async function POST(request: NextRequest) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const roleError = await requireRole(UserRole.EMPLOYEE)(request);
    if (roleError) return roleError;

    try {
        await dbConnect();

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createApplicationSchema.parse(body);

        // Check if job exists
        const job = await Job.findById(validatedData.jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({
            jobId: validatedData.jobId,
            employeeId: currentUser.userId,
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: 'You have already applied for this job' },
                { status: 400 }
            );
        }

        const application = await Application.create({
            ...validatedData,
            employeeId: currentUser.userId,
            status: ApplicationStatus.SUBMITTED,
        });

        return NextResponse.json(
            {
                message: 'Application submitted successfully',
                application,
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

        console.error('Create application error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
