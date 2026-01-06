import mongoose, { Schema, Document, Model } from 'mongoose';
import { JobStatus } from '@/lib/constants';

export interface IJob extends Document {
    _id: mongoose.Types.ObjectId;
    recruiterId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    requirements: string[];
    location: string;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
    salaryRange?: {
        min: number;
        max: number;
        currency: string;
    };
    status: JobStatus;
    company: string;
    companyLogo?: string;
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
    {
        recruiterId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        requirements: {
            type: [String],
            default: [],
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        employmentType: {
            type: String,
            enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'],
            required: true,
        },
        salaryRange: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'INR',
            },
        },
        status: {
            type: String,
            enum: Object.values(JobStatus),
            default: JobStatus.ACTIVE,
        },
        company: {
            type: String,
            required: true,
            trim: true,
        },
        companyLogo: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
JobSchema.index({ recruiterId: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ title: 'text', description: 'text' });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
