import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/lib/constants';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    passwordHash: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone?: string;
    company?: string; // For recruiters
    position?: string; // For employees
    bio?: string;
    skills?: string[];
    yearsOfExperience?: number;
    education?: {
        degree: string;
        institution: string;
        year?: number;
    };
    linkedIn?: string;
    portfolio?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        passwordHash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        position: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        skills: {
            type: [String],
        },
        yearsOfExperience: {
            type: Number,
            min: 0,
        },
        education: {
            degree: String,
            institution: String,
            year: Number,
        },
        linkedIn: {
            type: String,
            trim: true,
        },
        portfolio: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
UserSchema.index({ role: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
