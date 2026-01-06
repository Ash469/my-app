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
                    <div className="h-8 bg-white/10 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-white/10 rounded-2xl"></div>
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
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="text-gray-400">Here's an overview of your recruitment activities</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Jobs"
                        value={stats.totalJobs}
                        icon="💼"
                        gradient="gradient-primary"
                    />
                    <StatsCard
                        title="Active Jobs"
                        value={stats.activeJobs}
                        icon="✅"
                        gradient="bg-gradient-to-br from-green-500 to-emerald-500"
                    />
                    <StatsCard
                        title="Total Applications"
                        value={stats.totalApplications}
                        icon="📝"
                        gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                    />
                    <StatsCard
                        title="Pending Review"
                        value={stats.pendingReview}
                        icon="⏳"
                        gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
                    />
                </div>

                {/* Quick Actions */}
                <div className="glass p-6 rounded-2xl animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/dashboard/recruiter/jobs/new')}
                            className="glass p-4 rounded-xl hover:bg-white/20 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2">➕</div>
                            <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                Post New Job
                            </h3>
                            <p className="text-sm text-gray-400">Create a new job listing</p>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/recruiter/jobs')}
                            className="glass p-4 rounded-xl hover:bg-white/20 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2">💼</div>
                            <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                Manage Jobs
                            </h3>
                            <p className="text-sm text-gray-400">View and edit your postings</p>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/recruiter/applications')}
                            className="glass p-4 rounded-xl hover:bg-white/20 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2">📋</div>
                            <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                Review Applications
                            </h3>
                            <p className="text-sm text-gray-400">Check candidate applications</p>
                        </button>
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="glass p-6 rounded-2xl animate-fade-in">
                    <h2 className="text-xl font-bold text-white mb-4">Performance Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4">
                            <p className="text-3xl font-bold text-white mb-1">
                                {stats.totalApplications > 0 ? Math.round((stats.totalApplications / stats.totalJobs) * 10) / 10 : 0}
                            </p>
                            <p className="text-sm text-gray-400">Avg. Applications per Job</p>
                        </div>
                        <div className="text-center p-4">
                            <p className="text-3xl font-bold text-white mb-1">
                                {stats.totalApplications > 0 ? Math.round((stats.pendingReview / stats.totalApplications) * 100) : 0}%
                            </p>
                            <p className="text-sm text-gray-400">Pending Review Rate</p>
                        </div>
                        <div className="text-center p-4">
                            <p className="text-3xl font-bold text-white mb-1">
                                {stats.totalJobs > 0 ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0}%
                            </p>
                            <p className="text-sm text-gray-400">Active Jobs Rate</p>
                        </div>
                    </div>
                </div>

                {/* Getting Started */}
                {stats.totalJobs === 0 && (
                    <div className="glass p-8 rounded-2xl text-center animate-fade-in">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Get Started with Recruiting</h3>
                        <p className="text-gray-400 mb-6">Post your first job to start receiving applications</p>
                        <button
                            onClick={() => router.push('/dashboard/recruiter/jobs/new')}
                            className="gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Post Your First Job
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
