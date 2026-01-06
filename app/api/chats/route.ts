import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Chat from '@/models/Chat';
import Referee from '@/models/Referee';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { authMiddleware, getUserFromRequest, requireRole } from '@/lib/middleware';
import { UserRole, ApplicationStatus } from '@/lib/constants';
import { generateSecureToken, hashToken } from '@/lib/encryption';
import { sendRefereeInvitation } from '@/lib/email';
import { sendRefereeInvitationWhatsApp } from '@/lib/whatsapp';

// POST /api/chats - Create a new chat (Recruiter initiates with referee)
export async function POST(request: NextRequest) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const roleError = await requireRole(UserRole.RECRUITER)(request);
    if (roleError) return roleError;

    try {
        await dbConnect();

        const currentUser = getUserFromRequest(request);
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { applicationId, refereeId } = await request.json();

        if (!applicationId || !refereeId) {
            return NextResponse.json(
                { error: 'Application ID and Referee ID are required' },
                { status: 400 }
            );
        }

        // Verify application exists and belongs to recruiter's job
        const application = await Application.findById(applicationId).populate('jobId');
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const job = await Job.findById(application.jobId);
        if (!job || job.recruiterId.toString() !== currentUser.userId) {
            return NextResponse.json(
                { error: 'You can only create chats for your own job applications' },
                { status: 403 }
            );
        }

        // Verify referee exists and belongs to this application
        const referee = await Referee.findById(refereeId);
        if (!referee || referee.applicationId.toString() !== applicationId) {
            return NextResponse.json({ error: 'Referee not found for this application' }, { status: 404 });
        }

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            applicationId,
            refereeId,
        });

        if (existingChat) {
            // Return existing chat instead of error
            return NextResponse.json({
                message: 'Chat already exists',
                chat: existingChat,
            });
        }

        // Generate secure token for referee access
        const token = generateSecureToken();
        const tokenHash = hashToken(token);

        // Create chat
        const chat = await Chat.create({
            applicationId,
            recruiterId: currentUser.userId,
            refereeId,
            tokenHash,
            refereeToken: token, // Store original token for notifications
        });

        // Update application status
        if (application.status === ApplicationStatus.UNDER_REVIEW) {
            application.status = ApplicationStatus.REFEREE_CONTACTED;
            await application.save();
        }

        // Send email to referee with secure link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const chatUrl = `${baseUrl}/chat/${chat._id}?token=${token}`;
        await sendRefereeInvitation(referee.email, referee.name, chatUrl, job.title, job.company);

        // Send WhatsApp notification if phone number exists
        if (referee.phone) {
            try {
                await sendRefereeInvitationWhatsApp(
                    referee.phone,
                    referee.name,
                    chatUrl,
                    job.title,
                    job.company
                );
            } catch (error) {
                console.error('WhatsApp notification failed:', error);
                // Don't fail the request if WhatsApp fails
            }
        }

        return NextResponse.json(
            {
                message: 'Chat created successfully and invitation sent to referee',
                chat: chat,
                chatUrl,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create chat error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
