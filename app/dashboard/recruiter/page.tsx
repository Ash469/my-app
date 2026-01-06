'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingReview: number;
}

interface RecentActivity {
    _id: string;
    type: 'application' | 'job';
    title: string;
    subtitle: string;
    time: string;
}

export default function RecruiterDashboard() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingReview: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        if (!token) {
            return; // Wait for token to be loaded
        }
        fetchDashboardData();
    }, [user, token]);

    const fetchDashboardData = async () => {
        try {
            const statsRes = await fetch('/api/applications/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="animate-fade-in">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="text-gray-500">Here's an overview of your recruitment activities</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Jobs"
                        value={stats.totalJobs}
                        // icon="💼"
                        color="primary"
                    />
                    <StatsCard
                        title="Active Jobs"
                        value={stats.activeJobs}
                        // icon="✅"
                        color="success"
                    />
                    <StatsCard
                        title="Total Applications"
                        value={stats.totalApplications}
                        // icon="📝"
                        color="warning"
                    />
                    <StatsCard
                        title="Pending Review"
                        value={stats.pendingReview}
                        // icon="⏳"
                        color="error"
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-100 p-6 rounded-2xl animate-fade-in shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/dashboard/recruiter/jobs/new')}
                            className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2 text-blue-600">➕</div>
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                Post New Job
                            </h3>
                            <p className="text-sm text-slate-500">Create a new job listing</p>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/recruiter/jobs')}
                            className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2 text-blue-600">💼</div>
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                Manage Jobs
                            </h3>
                            <p className="text-sm text-slate-500">View and edit your postings</p>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/recruiter/applications')}
                            className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2 text-blue-600">📋</div>
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                Review Applications
                            </h3>
                            <p className="text-sm text-slate-500">Check candidate applications</p>
                        </button>
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="bg-white border border-gray-100 p-6 rounded-2xl animate-fade-in shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-4">Performance Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4">
                            <p className="text-3xl font-bold text-slate-800 mb-1">
                                {stats.totalApplications > 0 ? Math.round((stats.totalApplications / stats.totalJobs) * 10) / 10 : 0}
                            </p>
                            <p className="text-sm text-slate-500">Avg. Applications per Job</p>
                        </div>
                        <div className="text-center p-4">
                            <p className="text-3xl font-bold text-slate-800 mb-1">
                                {stats.totalApplications > 0 ? Math.round((stats.pendingReview / stats.totalApplications) * 100) : 0}%
                            </p>
                            <p className="text-sm text-slate-500">Pending Review Rate</p>
                        </div>
                        <div className="text-center p-4">
                            <p className="text-3xl font-bold text-slate-800 mb-1">
                                {stats.totalJobs > 0 ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0}%
                            </p>
                            <p className="text-sm text-slate-500">Active Jobs Rate</p>
                        </div>
                    </div>
                </div>

                {/* Getting Started */}
                {stats.totalJobs === 0 && (
                    <div className="bg-white border border-gray-100 p-8 rounded-2xl text-center animate-fade-in shadow-sm">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Get Started with Recruiting</h3>
                        <p className="text-gray-500 mb-6">Post your first job to start receiving applications</p>
                        <button
                            onClick={() => router.push('/dashboard/recruiter/jobs/new')}
                            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Post Your First Job
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
