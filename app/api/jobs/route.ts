import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Job from '@/models/Job';
import { authMiddleware, getUserFromRequest, requireRole } from '@/lib/middleware';
import { UserRole, JobStatus } from '@/lib/constants';
import { z } from 'zod';

const createJobSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    requirements: z.array(z.string()).default([]),
    location: z.string().min(1, 'Location is required'),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
    salaryRange: z.object({
        min: z.number().positive(),
        max: z.number().positive(),
        currency: z.string().default('USD'),
    }).optional(),
    company: z.string().min(1, 'Company name is required'),
    companyLogo: z.string().url().optional(),
});

// GET /api/jobs - List all active jobs
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Ensure User model is registered (sometimes Next.js tree-shaking misses it)
        if (!mongoose.models.User) {
            console.log('User model not found in mongoose.models, re-importing...');
            await import('@/models/User');
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const location = searchParams.get('location');
        const employmentType = searchParams.get('employmentType');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const query: any = { status: JobStatus.ACTIVE };

        if (search) {
            query.$text = { $search: search };
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (employmentType) {
            query.employmentType = employmentType;
        }

        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .populate('recruiterId', 'firstName lastName company')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Job.countDocuments(query),
        ]);

        return NextResponse.json({
            jobs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/jobs - Create a new job (Recruiter only)
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const validatedData = createJobSchema.parse(body);

        const job = await Job.create({
            ...validatedData,
            recruiterId: currentUser.userId,
            status: JobStatus.ACTIVE,
        });

        return NextResponse.json(
            {
                message: 'Job created successfully',
                job,
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

        console.error('Create job error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
