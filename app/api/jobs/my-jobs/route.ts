import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { authMiddleware, getUserFromRequest, requireRole } from '@/lib/middleware';
import { UserRole, JobStatus } from '@/lib/constants';

// GET /api/jobs/my-jobs - Get recruiter's jobs
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

        const jobs = await Job.find({ recruiterId: currentUser.userId })
            .sort({ createdAt: -1 });

        // Get application counts for each job
        const Application = (await import('@/models/Application')).default;
        const jobsWithCounts = await Promise.all(
            jobs.map(async (job) => {
                const applicationsCount = await Application.countDocuments({ jobId: job._id });
                return {
                    ...job.toObject(),
                    applicationsCount,
                };
            })
        );

        return NextResponse.json({ jobs: jobsWithCounts });
    } catch (error) {
        console.error('Get my jobs error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
