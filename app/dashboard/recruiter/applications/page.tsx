'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';

interface Application {
    _id: string;
    jobId: {
        _id: string;
        title: string;
    };
    employeeId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    status: string;
    resumeUrl: string;
    coverLetter?: string;
    createdAt: string;
}

export default function RecruiterApplicationsPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        fetchApplications();
    }, [user, filter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'ALL') {
                params.append('status', filter);
            }

            const response = await fetch(`/api/applications/recruiter?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data.applications || []);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusFilters = [
        { value: 'ALL', label: 'All Applications' },
        { value: 'SUBMITTED', label: 'Submitted' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
        { value: 'REFEREE_CONTACTED', label: 'Referee Contacted' },
        { value: 'VERIFIED', label: 'Verified' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'HIRED', label: 'Hired' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-bold text-white mb-2">Applications Received</h1>
                    <p className="text-gray-400">Review and manage candidate applications</p>
                </div>

                {/* Filters */}
                <div className="glass p-4 rounded-2xl animate-fade-in">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setFilter(status.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status.value
                                    ? 'gradient-primary text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="glass p-6 rounded-2xl h-40 animate-pulse">
                                <div className="h-6 bg-white/10 rounded mb-4"></div>
                                <div className="h-4 bg-white/10 rounded mb-2"></div>
                                <div className="h-4 bg-white/10 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="glass p-12 rounded-2xl text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {filter === 'ALL' ? 'No applications yet' : `No ${filter.toLowerCase().replace('_', ' ')} applications`}
                        </h3>
                        <p className="text-gray-400">
                            {filter === 'ALL'
                                ? 'Applications will appear here once candidates start applying'
                                : 'Try selecting a different filter'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <div key={application._id} className="glass p-6 rounded-2xl hover:scale-[1.01] transition-all animate-fade-in">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-bold text-white">
                                                {application.employeeId.firstName} {application.employeeId.lastName}
                                            </h3>
                                            <StatusBadge status={application.status} size="sm" />
                                        </div>
                                        <p className="text-gray-300 mb-1">
                                            Applied for: <Link href={`/jobs/${application.jobId._id}`} className="text-purple-400 hover:text-purple-300">
                                                {application.jobId.title}
                                            </Link>
                                        </p>
                                        <p className="text-sm text-gray-400">{application.employeeId.email}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <a
                                            href={application.resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 glass rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
                                        >
                                            📄 Resume
                                        </a>
                                        <Link
                                            href={`/dashboard/recruiter/applications/${application._id}`}
                                            className="px-4 py-2 gradient-primary rounded-lg text-white hover:opacity-90 transition-opacity text-sm"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                </div>

                                {application.coverLetter && (
                                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                        <p className="text-xs text-gray-400 mb-2">Cover Letter</p>
                                        <p className="text-sm text-gray-300 line-clamp-3">{application.coverLetter}</p>
                                    </div>
                                )}

                                <div className="mt-4 text-sm text-gray-400">
                                    Applied on {new Date(application.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
