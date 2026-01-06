'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ApplicationCard from '@/components/ApplicationCard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';

interface Application {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        company: string;
        location: string;
    };
    status: string;
    createdAt: string;
    feedback?: string;
}

export default function EmployeeApplicationsPage() {
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

            const response = await fetch(`/api/applications?${params}`, {
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
                <div className="flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
                        <p className="text-gray-500">Track and manage your job applications</p>
                    </div>
                    <button
                        onClick={() => router.push('/jobs')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        + Apply to Jobs
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-100 p-4 rounded-2xl animate-fade-in shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setFilter(status.value)}
                                className={`px-4 py-2 rounded-lg font-bold border transition-all ${filter === status.value
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
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
                            <div key={i} className="bg-white border border-gray-100 p-6 rounded-2xl h-32 animate-pulse shadow-sm">
                                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-sm">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            {filter === 'ALL' ? 'No applications yet' : `No ${filter.toLowerCase().replace('_', ' ')} applications`}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'ALL'
                                ? 'Start applying to jobs to see them here'
                                : 'Try selecting a different filter'}
                        </p>
                        <button
                            onClick={() => router.push('/jobs')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <ApplicationCard key={application._id} application={application} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
