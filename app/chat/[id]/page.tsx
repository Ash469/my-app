'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/constants';

interface Message {
    _id: string;
    senderType: 'RECRUITER' | 'REFEREE';
    content: string;
    createdAt: string;
    isRead: boolean;
}

interface Chat {
    _id: string;
    applicationId: {
        jobId: {
            title: string;
            company: string;
        };
        employeeId: {
            firstName: string;
            lastName: string;
        };
    };
    refereeId: {
        name: string;
        email: string;
    };
}

export default function ChatPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, token, isLoading: authLoading } = useAuth();
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatId = params.id as string;
    const refereeToken = searchParams.get('token');
    const isReferee = !user && refereeToken;
    const isRecruiter = user?.role === UserRole.RECRUITER;

    useEffect(() => {
        if (authLoading) return;

        // For recruiters: wait until both user AND token are loaded
        // For referees: just need the token from URL
        const canFetch = isRecruiter ? (user && token) : (isReferee && refereeToken);

        if (canFetch) {
            fetchChat();
        } else if (!isReferee && !isRecruiter && !authLoading) {
            // Not a referee and not a logged in recruiter, finished loading
            setLoading(false);
        }
    }, [chatId, user, token, refereeToken, authLoading, isRecruiter, isReferee]);

    // Fetch messages only after chat is loaded
    useEffect(() => {
        if (!chat) return;

        fetchMessages();

        // Poll for new messages every 3 seconds
        const interval = setInterval(() => {
            fetchMessages();
        }, 3000);

        return () => clearInterval(interval);
    }, [chat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChat = async () => {
        try {
            let url = `/api/chats/${chatId}`;
            const headers: HeadersInit = {};

            if (refereeToken) {
                // Add token as query param for chat details
                url += `?token=${refereeToken}`;
            } else if (isRecruiter && token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, { headers });
            console.log('Chat API response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                setChat(data.chat);
            } else {
                const errorData = await response.json();
                console.error('Chat API error:', errorData);
                // Don't redirect, just show error state
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const headers: HeadersInit = {};

            // Prioritize referee token if present in URL
            if (refereeToken) {
                headers['X-Referee-Token'] = refereeToken;
            } else if (isRecruiter && token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('Fetching messages with headers:', { isRecruiter, isReferee, hasToken: !!token, hasRefereeToken: !!refereeToken });
            const response = await fetch(`/api/chats/${chatId}/messages`, { headers });
            console.log('Messages response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Messages received:', data.messages?.length || 0, 'messages');
                setMessages(data.messages);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch messages:', errorData);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            // Prioritize referee token if present in URL
            if (refereeToken) {
                headers['X-Referee-Token'] = refereeToken;
            } else if (isRecruiter && token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/chats/${chatId}/messages`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ content: newMessage }),
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
            } else {
                console.error('Failed to send message, status:', response.status);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-foreground text-center">Getting ready with your chats...</p>
                    <p className="text-sm text-gray-500 mt-2 text-center">Please wait</p>
                </div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-sm">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Chat not found</h2>
                    <p className="text-gray-500">This chat may have been removed or you don't have access</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <h1 className="text-xl font-bold text-foreground">
                                {isRecruiter ? `Chat with ${chat.refereeId.name}` : 'Recruiter Chat'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Re: {chat.applicationId.employeeId.firstName} {chat.applicationId.employeeId.lastName} • {chat.applicationId.jobId.title}
                            </p>
                        </div>
                        {isRecruiter && (
                            <button
                                onClick={() => router.back()}
                                className="text-gray-600 hover:text-primary transition-colors font-medium"
                            >
                                ← Back
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col shadow-sm" style={{ height: 'calc(100vh - 200px)' }}>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <p className="text-lg mb-2">💬</p>
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message) => {
                                const isOwnMessage = isRecruiter
                                    ? message.senderType === 'RECRUITER'
                                    : message.senderType === 'REFEREE';

                                return (
                                    <div
                                        key={message._id}
                                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage
                                                ? 'bg-[#3b82f6] text-white border-transparent'
                                                : 'bg-[#f1f5f9] text-[#1e293b] border border-slate-100'
                                                }`}
                                        >
                                            <p className="text-sm mb-1 font-medium">{message.content}</p>
                                            <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {new Date(message.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-4 bg-gray-50/50">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-[#1e293b] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent font-medium"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="px-6 py-3 bg-[#2563eb] text-white rounded-lg font-bold hover:bg-[#1d4ed8] transition-all disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
