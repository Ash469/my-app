import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';
import { authMiddleware, getUserFromRequest } from '@/lib/middleware';
import { UserRole, ApplicationStatus, JobStatus } from '@/lib/constants';

// GET /api/applications/stats - Get application statistics
export async function GET(request: NextRequest) {
    // Verify authentication
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        await dbConnect();

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (currentUser.role === UserRole.EMPLOYEE) {
            // Employee stats
            const totalApplications = await Application.countDocuments({
                employeeId: currentUser.userId,
            });

            const pending = await Application.countDocuments({
                employeeId: currentUser.userId,
                status: ApplicationStatus.SUBMITTED,
            });

            const underReview = await Application.countDocuments({
                employeeId: currentUser.userId,
                status: { $in: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REFEREE_CONTACTED] },
            });

            const hired = await Application.countDocuments({
                employeeId: currentUser.userId,
                status: ApplicationStatus.HIRED,
            });

            return NextResponse.json({
                totalApplications,
                pending,
                underReview,
                hired,
            });
        } else if (currentUser.role === UserRole.RECRUITER) {
            // Recruiter stats
            const totalJobs = await Job.countDocuments({
                recruiterId: currentUser.userId,
            });

            const activeJobs = await Job.countDocuments({
                recruiterId: currentUser.userId,
                status: JobStatus.ACTIVE,
            });

            // Get all jobs for this recruiter
            const recruiterJobs = await Job.find({ recruiterId: currentUser.userId });
            const jobIds = recruiterJobs.map(job => job._id);

            const totalApplications = await Application.countDocuments({
                jobId: { $in: jobIds },
            });

            const pendingReview = await Application.countDocuments({
                jobId: { $in: jobIds },
                status: { $in: [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW] },
            });

            return NextResponse.json({
                totalJobs,
                activeJobs,
                totalApplications,
                pendingReview,
            });
        }

        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
