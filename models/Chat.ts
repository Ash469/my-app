import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IMessage {
    _id?: string;
    senderType: 'RECRUITER' | 'REFEREE';
    encryptedContent: string;
    createdAt: Date;
    isRead: boolean;
}

export interface IChat {
    _id: string; // UUID v4
    applicationId: mongoose.Types.ObjectId;
    recruiterId: mongoose.Types.ObjectId;
    refereeId: mongoose.Types.ObjectId;
    tokenHash: string; // Hashed access token for referee
    refereeToken: string; // Original token for referee (for notifications)
    messages: IMessage[]; // Store messages inline
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema({
    senderType: {
        type: String,
        enum: ['RECRUITER', 'REFEREE'],
        required: true,
    },
    encryptedContent: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ChatSchema = new Schema<IChat>(
    {
        _id: {
            type: String,
            default: () => uuidv4(),
        },
        applicationId: {
            type: Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
        },
        recruiterId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        refereeId: {
            type: Schema.Types.ObjectId,
            ref: 'Referee',
            required: true,
        },
        tokenHash: {
            type: String,
            required: true,
        },
        refereeToken: {
            type: String,
            required: true,
        },
        messages: {
            type: [MessageSchema],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        _id: false, // Disable auto-generation of _id since we're using UUID
    }
);

// Indexes
ChatSchema.index({ applicationId: 1 });
ChatSchema.index({ recruiterId: 1 });
ChatSchema.index({ refereeId: 1 });
ChatSchema.index({ tokenHash: 1 });

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;
