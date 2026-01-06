'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';

interface Application {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        company: string;
        location: string;
        description: string;
        salaryRange: {
            min: number;
            max: number;
        };
    };
    status: string;
    feedback?: string;
    createdAt: string;
    resumeUrl: string;
    coverLetter?: string;
}

export default function EmployeeApplicationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

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
            if (response.ok) {
                const data = await response.json();
                setApplication(data.application);
            } else {
                const error = await response.json();
                console.error('API Error:', error);
            }
        } catch (error) {
            console.error('Error fetching application:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                    <div className="bg-white border border-slate-200 p-6 rounded-xl h-96 shadow-sm"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!application) {
        return (
            <DashboardLayout>
                <div className="bg-white border border-slate-200 p-12 rounded-xl text-center shadow-sm">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Application not found</h2>
                    <button
                        onClick={() => router.back()}
                        className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{application.jobId.title}</h1>
                            <p className="text-slate-500 font-medium">{application.jobId.company} • {application.jobId.location}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={application.status} size="lg" />
                            <button
                                onClick={() => router.push(`/jobs/${application.jobId._id}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                View Job
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Feedback Section (if any) */}
                    {application.feedback && (
                        <div className="bg-white border border-slate-200 p-6 rounded-xl animate-fade-in shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Recruiter Feedback</h2>
                            <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-lg border border-slate-200">
                                {application.feedback}
                            </p>
                        </div>
                    )}

                    {/* Application Details */}
                    <div className="bg-white border border-slate-200 p-6 rounded-xl animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Your Application</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resume</h3>
                                <a
                                    href={application.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors font-bold"
                                >
                                    <span>📄</span>
                                    <span>View Resume</span>
                                </a>
                            </div>

                            {application.coverLetter && (
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cover Letter</h3>
                                    <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-200 font-medium">
                                        {application.coverLetter}
                                    </p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Submitted On</h3>
                                <p className="text-slate-900 font-medium">
                                    {new Date(application.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
