import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chat from '@/models/Chat';
import { authMiddleware, getUserFromRequest } from '@/lib/middleware';
import { hashToken } from '@/lib/encryption';
import { decrypt } from '@/lib/encryption';

// GET /api/chats/[chatId] - Get chat details and messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        await dbConnect();
        const { chatId } = await params;
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        // Check if accessing via token (referee) or auth (recruiter)
        let chat;
        let isReferee = false;

        if (token) {
            // Referee access via token
            const tokenHash = hashToken(token);
            chat = await Chat.findOne({ _id: chatId, tokenHash });

            // Fallback: Check direct token match
            if (!chat) {
                chat = await Chat.findOne({ _id: chatId, refereeToken: token });
            }
            isReferee = true;
        } else {
            // Recruiter access via auth
            const authError = await authMiddleware(request);
            if (authError) return authError;

            const currentUser = getUserFromRequest(request);
            if (!currentUser) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            chat = await Chat.findOne({ _id: chatId, recruiterId: currentUser.userId });
        }

        if (!chat) {
            console.error(`Chat lookup failed for chatId: ${chatId}. Is Referee: ${!!token}`);
            if (token) {
                const tokenHash = hashToken(token);
                console.error(`Token provided. Hash: ${tokenHash}`);
                const directMatch = await Chat.findOne({ _id: chatId, refereeToken: token });
                console.error(`Direct token match found: ${!!directMatch}`);
                const hashMatch = await Chat.findOne({ _id: chatId, tokenHash });
                console.error(`Hash token match found: ${!!hashMatch}`);
            }
            return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 });
        }

        // Decrypt messages from chat.messages array
        const decryptedMessages = (chat.messages || []).map((msg: any) => ({
            _id: msg._id || 'temp-id', // Fallback ID
            senderType: msg.senderType,
            content: decrypt(msg.encryptedContent),
            createdAt: msg.createdAt,
            isRead: msg.isRead,
        }));

        // Populate chat details
        const populatedChat = await Chat.findById(chatId)
            .populate('applicationId')
            .populate('recruiterId', 'firstName lastName company')
            .populate('refereeId', 'name email relationship company position');

        return NextResponse.json({
            chat: populatedChat,
            messages: decryptedMessages,
            isReferee,
        });
    } catch (error) {
        console.error('Get chat error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
