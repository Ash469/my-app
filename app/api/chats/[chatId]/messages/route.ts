import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chat from '@/models/Chat';
import Referee from '@/models/Referee';
import User from '@/models/User';
import { authMiddleware, getUserFromRequest } from '@/lib/middleware';
import { hashToken, encrypt, decrypt } from '@/lib/encryption';
import { SenderType } from '@/lib/constants';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { sendNewMessageNotification } from '@/lib/email';
import { sendNewMessageNotificationWhatsApp } from '@/lib/whatsapp';

const sendMessageSchema = z.object({
    content: z.string().min(1, 'Message content is required').max(5000),
});

// GET /api/chats/[chatId]/messages - Get all messages in a chat
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        await dbConnect();
        const { chatId } = await params;

        // Check if request is from referee (has token) or recruiter (has auth)
        const refereeToken = request.headers.get('X-Referee-Token');

        let chat;
        if (refereeToken) {
            // Referee accessing chat
            // Try matching by hash first
            const tokenHash = hashToken(refereeToken);
            chat = await Chat.findOne({ _id: chatId, tokenHash });

            // If not found by hash, try direct match with stored token (fallback)
            if (!chat) {
                chat = await Chat.findOne({ _id: chatId, refereeToken: refereeToken });
            }
        } else {
            // Recruiter accessing chat
            const authError = await authMiddleware(request);
            if (authError) return authError;

            const currentUser = getUserFromRequest(request);
            if (!currentUser) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            chat = await Chat.findOne({ _id: chatId, recruiterId: currentUser.userId });
        }

        if (!chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Decrypt messages from chat.messages array
        const decryptedMessages = (chat.messages || []).map((msg: any) => ({
            _id: msg._id || uuidv4(), // Fallback for old messages
            senderType: msg.senderType,
            content: decrypt(msg.encryptedContent),
            createdAt: msg.createdAt,
            isRead: msg.isRead,
        }));

        return NextResponse.json({ messages: decryptedMessages });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/chats/[chatId]/messages - Send a message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        await dbConnect();
        const { chatId } = await params;
        const refereeToken = request.headers.get('X-Referee-Token');

        const body = await request.json();
        const { content } = sendMessageSchema.parse(body);

        let chat;
        let senderType: SenderType;
        let recipientEmail: string;
        let recipientName: string;

        if (refereeToken) {
            // Referee sending message
            const tokenHash = hashToken(refereeToken);
            chat = await Chat.findOne({ _id: chatId, tokenHash })
                .populate('refereeId')
                .populate('recruiterId');

            if (!chat) {
                return NextResponse.json({ error: 'Chat not found or invalid token' }, { status: 404 });
            }

            senderType = SenderType.REFEREE;

            // Get recruiter details for notification
            const recruiter = await User.findById(chat.recruiterId);
            recipientEmail = recruiter!.email;
            recipientName = `${recruiter!.firstName} ${recruiter!.lastName}`;
        } else {
            // Recruiter sending message
            const authError = await authMiddleware(request);
            if (authError) return authError;

            const currentUser = getUserFromRequest(request);
            if (!currentUser) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            chat = await Chat.findOne({ _id: chatId, recruiterId: currentUser.userId })
                .populate('refereeId');

            if (!chat) {
                return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
            }

            senderType = SenderType.RECRUITER;

            // Get referee details for notification
            const referee = await Referee.findById(chat.refereeId);
            recipientEmail = referee!.email;
            recipientName = referee!.name;
        }

        // Encrypt message content
        const encryptedContent = encrypt(content);

        // Add message to chat.messages array
        chat.messages.push({
            senderType,
            encryptedContent,
            createdAt: new Date(),
            isRead: false,
        });

        await chat.save();

        // Send email notification to recipient with token
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const chatUrl = senderType === SenderType.REFEREE
            ? `${baseUrl}/chat/${chatId}` // Recruiter doesn't need token
            : `${baseUrl}/chat/${chatId}?token=${chat.refereeToken}`; // Use stored token for referee

        await sendNewMessageNotification(recipientEmail, recipientName, chatUrl);

        // Send WhatsApp notification
        try {
            // Check if recipient has a phone number
            // We need to fetch the full user/referee object to get the phone number if it wasn't populated or available
            // In the code above:
            // - If Recruiter sending: 'chat' is populated with 'refereeId'. referee.phone should be available.
            // - If Referee sending: 'chat' is populated with 'recruiterId'. recruiter (User) phone might not be selected by default, let's check.

            let recipientPhone: string | undefined;

            if (senderType === SenderType.RECRUITER) {
                const referee = await Referee.findById(chat.refereeId);
                recipientPhone = referee?.phone;
            } else {
                const recruiter = await User.findById(chat.recruiterId);
                recipientPhone = recruiter?.phone;
            }

            if (recipientPhone) {
                await sendNewMessageNotificationWhatsApp(recipientPhone, recipientName, chatUrl);
            }
        } catch (error) {
            console.error('Failed to send WhatsApp notification:', error);
            // Don't block the response
        }

        return NextResponse.json(
            {
                message: 'Message sent successfully',
                content, // Return decrypted content for immediate display
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

        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
