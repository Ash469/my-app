import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';
import { authMiddleware, getUserFromRequest, requireRole } from '@/lib/middleware';
import { UserRole } from '@/lib/constants';

// GET /api/applications/recruiter - Get applications for recruiter's jobs
export async function GET(request: NextRequest) {
    // Verify authentication
    const authError = await authMiddleware(request);
    if (authError) return authError;

    // Check if user is a recruiter
    const roleError = await requireRole(UserRole.RECRUITER)(request);
    if (roleError) return roleError;

    try {
        await dbConnect();

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const jobId = searchParams.get('jobId');

        // Get all jobs for this recruiter to ensure they only see their own applications
        const recruiterJobs = await Job.find({ recruiterId: currentUser.userId });
        const jobIds = recruiterJobs.map(job => job._id);

        let query: any = {};

        if (jobId) {
            // Verify this job belongs to the recruiter
            const isOwned = jobIds.some(id => id.toString() === jobId);
            if (!isOwned) {
                return NextResponse.json({ applications: [] });
            }
            query.jobId = jobId;
        } else {
            // Show applications for all jobs owned by the recruiter
            query.jobId = { $in: jobIds };
        }

        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate('jobId', 'title company')
            .populate('employeeId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error('Get recruiter applications error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
