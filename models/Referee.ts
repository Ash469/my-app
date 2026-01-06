import mongoose, { Schema, Document, Model } from 'mongoose';
import { REFEREE_RELATIONSHIPS, RefereeRelationship } from '@/lib/constants';

export interface IReferee extends Document {
    _id: mongoose.Types.ObjectId;
    applicationId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    relationship: RefereeRelationship;
    company?: string;
    position?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RefereeSchema = new Schema<IReferee>(
    {
        applicationId: {
            type: Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        phone: {
            type: String,
            trim: true,
        },
        relationship: {
            type: String,
            enum: REFEREE_RELATIONSHIPS,
            required: true,
        },
        company: {
            type: String,
            trim: true,
        },
        position: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
RefereeSchema.index({ applicationId: 1 });
RefereeSchema.index({ email: 1 });

const Referee: Model<IReferee> =
    mongoose.models.Referee || mongoose.model<IReferee>('Referee', RefereeSchema);

export default Referee;
