import mongoose, { Schema, Document, Model } from 'mongoose';
import { SenderType } from '@/lib/constants';

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    chatId: string; // UUID reference to Chat
    senderType: SenderType;
    senderId: mongoose.Types.ObjectId; // Either recruiterId or refereeId
    encryptedContent: string; // AES-256 encrypted message
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        chatId: {
            type: String,
            required: true,
            ref: 'Chat',
        },
        senderType: {
            type: String,
            enum: Object.values(SenderType),
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'senderModel',
        },
        encryptedContent: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ chatId: 1, isRead: 1 });

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
