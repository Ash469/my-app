'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicationStatus } from '@/lib/constants';

interface Application {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        company: string;
        location: string;
    };
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        position?: string;
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
    };
    status: string;
    resumeUrl: string;
    coverLetter?: string;
    feedback?: string;
    internalNotes?: string;
    createdAt: string;
    referees: Array<{
        _id: string;
        name: string;
        email: string;
        phone?: string;
        relationship: string;
        company?: string;
        position?: string;
    }>;
}

export default function ApplicationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [feedback, setFeedback] = useState('');
    const [internalNotes, setInternalNotes] = useState('');

    useEffect(() => {
        if (!user || !token) {
            router.push('/auth/login');
            return;
        }
        fetchApplication();
    }, [user, token]);

    const fetchApplication = async () => {
        try {
            const response = await fetch(`/api/applications/${params.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            console.log('API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Application data:', data);
                setApplication(data.application);
                setNewStatus(data.application.status);
                setFeedback(data.application.feedback || '');
                setInternalNotes(data.application.internalNotes || '');
            } else {
                const error = await response.json();
                console.error('API Error:', error);
                alert(`Failed to load application: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
            alert('Failed to fetch application');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/applications/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: newStatus,
                    feedback,
                    internalNotes,
                }),
            });

            if (response.ok) {
                alert('Application updated successfully!');
                fetchApplication();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update application');
            }
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Failed to update application');
        } finally {
            setUpdating(false);
        }
    };

    const [connectingReferee, setConnectingReferee] = useState<string | null>(null);

    const handleContactReferee = async (refereeId: string, refereeName: string) => {
        setConnectingReferee(refereeName);

        try {
            const response = await fetch('/api/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    applicationId: params.id,
                    refereeId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Auto-navigate to chat
                window.open(`/chat/${data.chat._id}`, '_blank');
                setConnectingReferee(null);
            } else {
                const error = await response.json();
                console.error('Failed to create chat:', error);
                setConnectingReferee(null);
            }
        } catch (error) {
            console.error('Error opening chat:', error);
            setConnectingReferee(null);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-white/10 rounded w-1/3"></div>
                    <div className="glass p-6 rounded-2xl h-96"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!application) {
        return (
            <DashboardLayout>
                <div className="glass p-12 rounded-2xl text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Application not found</h2>
                    <button
                        onClick={() => router.back()}
                        className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Connecting Loader Overlay */}
            {connectingReferee && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="glass p-8 rounded-2xl text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-xl font-semibold text-white">Establishing connection with {connectingReferee}...</p>
                        <p className="text-sm text-gray-400 mt-2">Please wait</p>
                    </div>
                </div>
            )}

            <div className="max-w-5xl">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Application Review</h1>
                            <p className="text-gray-400">
                                {application.employeeId.firstName} {application.employeeId.lastName} • {application.jobId.title}
                            </p>
                        </div>
                        <StatusBadge status={application.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Candidate Profile */}
                        <div className="glass p-6 rounded-2xl animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-4">Candidate Profile</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Name</h3>
                                    <p className="text-white">{application.employeeId.firstName} {application.employeeId.lastName}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Email</h3>
                                        <p className="text-white">{application.employeeId.email}</p>
                                    </div>
                                    {application.employeeId.phone && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-400 mb-1">Phone</h3>
                                            <p className="text-white">{application.employeeId.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {application.employeeId.position && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Current Position</h3>
                                        <p className="text-white">{application.employeeId.position}</p>
                                    </div>
                                )}

                                {application.employeeId.yearsOfExperience !== undefined && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Experience</h3>
                                        <p className="text-white">{application.employeeId.yearsOfExperience} years</p>
                                    </div>
                                )}

                                {application.employeeId.bio && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Bio</h3>
                                        <p className="text-white">{application.employeeId.bio}</p>
                                    </div>
                                )}

                                {application.employeeId.skills && application.employeeId.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {application.employeeId.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {application.employeeId.education && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Education</h3>
                                        <p className="text-white">
                                            {application.employeeId.education.degree}
                                            {application.employeeId.education.institution && ` • ${application.employeeId.education.institution}`}
                                            {application.employeeId.education.year && ` • ${application.employeeId.education.year}`}
                                        </p>
                                    </div>
                                )}

                                <div className="flex space-x-4">
                                    {application.employeeId.linkedIn && (
                                        <a
                                            href={application.employeeId.linkedIn}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:text-purple-300 text-sm"
                                        >
                                            LinkedIn →
                                        </a>
                                    )}
                                    {application.employeeId.portfolio && (
                                        <a
                                            href={application.employeeId.portfolio}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:text-purple-300 text-sm"
                                        >
                                            Portfolio →
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Resume & Cover Letter */}
                        <div className="glass p-6 rounded-2xl animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-4">Application Materials</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Resume</h3>
                                    <a
                                        href={application.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 px-4 py-2 glass rounded-lg text-white hover:bg-white/20 transition-colors"
                                    >
                                        <span>📄</span>
                                        <span>View Resume</span>
                                    </a>
                                </div>

                                {application.coverLetter && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Cover Letter</h3>
                                        <p className="text-white whitespace-pre-line p-4 bg-white/5 rounded-lg">
                                            {application.coverLetter}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Referees */}
                        <div className="glass p-6 rounded-2xl animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-4">Professional Referees</h2>

                            <div className="space-y-4">
                                {application.referees.map((referee) => (
                                    <div key={referee._id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-white mb-1">{referee.name}</h3>
                                                <p className="text-sm text-gray-400">{referee.relationship}</p>
                                            </div>
                                            <button
                                                onClick={() => handleContactReferee(referee._id, referee.name)}
                                                className="px-4 py-2 gradient-primary rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                                            >
                                                💬 Contact
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-400">Email:</span>
                                                <span className="text-white ml-2">{referee.email}</span>
                                            </div>
                                            {referee.phone && (
                                                <div>
                                                    <span className="text-gray-400">Phone:</span>
                                                    <span className="text-white ml-2">{referee.phone}</span>
                                                </div>
                                            )}
                                            {referee.company && (
                                                <div>
                                                    <span className="text-gray-400">Company:</span>
                                                    <span className="text-white ml-2">{referee.company}</span>
                                                </div>
                                            )}
                                            {referee.position && (
                                                <div>
                                                    <span className="text-gray-400">Position:</span>
                                                    <span className="text-white ml-2">{referee.position}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Actions */}
                    <div className="space-y-6">
                        {/* Update Status */}
                        <div className="glass p-6 rounded-2xl animate-fade-in">
                            <h2 className="text-lg font-bold text-white mb-4">Update Status</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {Object.values(ApplicationStatus).map((status) => (
                                            <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Feedback (visible to candidate)
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Feedback for the candidate..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Internal Notes (private)
                                    </label>
                                    <textarea
                                        value={internalNotes}
                                        onChange={(e) => setInternalNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Internal notes..."
                                    />
                                </div>

                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={updating}
                                    className="w-full gradient-primary text-white px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Update Application'}
                                </button>
                            </div>
                        </div>

                        {/* Application Info */}
                        <div className="glass p-6 rounded-2xl animate-fade-in">
                            <h2 className="text-lg font-bold text-white mb-4">Application Info</h2>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-400">Applied:</span>
                                    <p className="text-white">
                                        {new Date(application.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Job:</span>
                                    <p className="text-white">{application.jobId.title}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Location:</span>
                                    <p className="text-white">{application.jobId.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
