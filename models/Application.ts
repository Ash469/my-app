import mongoose, { Schema, Document, Model } from 'mongoose';
import { ApplicationStatus } from '@/lib/constants';

export interface IApplication extends Document {
    _id: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
    employeeId: mongoose.Types.ObjectId;
    status: ApplicationStatus;
    resumeUrl: string;
    coverLetter?: string;
    feedback?: string; // Limited feedback visible to employee
    internalNotes?: string; // Recruiter-only notes
    statusHistory: {
        status: ApplicationStatus;
        changedAt: Date;
        changedBy?: mongoose.Types.ObjectId;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
    {
        jobId: {
            type: Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(ApplicationStatus),
            default: ApplicationStatus.SUBMITTED,
        },
        resumeUrl: {
            type: String,
            required: true,
        },
        coverLetter: {
            type: String,
            maxlength: 2000,
        },
        feedback: {
            type: String,
            maxlength: 500,
        },
        internalNotes: {
            type: String,
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: Object.values(ApplicationStatus),
                    required: true,
                },
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
                changedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ employeeId: 1 });
ApplicationSchema.index({ status: 1 });

// Automatically add to status history when status changes
ApplicationSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date(),
        });
    }
    next();
});

const Application: Model<IApplication> =
    mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
