'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import ApplicationCard from '@/components/ApplicationCard';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
    totalApplications: number;
    pending: number;
    underReview: number;
    hired: number;
}

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

export default function EmployeeDashboard() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalApplications: 0,
        pending: 0,
        underReview: 0,
        hired: 0,
    });
    const [recentApplications, setRecentApplications] = useState<Application[]>([]);
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
            const [statsRes, appsRes] = await Promise.all([
                fetch('/api/applications/stats', {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch('/api/applications?limit=5', {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (appsRes.ok) {
                const appsData = await appsRes.json();
                setRecentApplications(appsData.applications || []);
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
                    <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
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
                    <p className="text-gray-500">Here's an overview of your job applications</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Applications"
                        value={stats.totalApplications}
                        // icon="📝"
                        color="primary"
                    />
                    <StatsCard
                        title="Pending Review"
                        value={stats.pending}
                        // icon="⏳"
                        color="warning"
                    />
                    <StatsCard
                        title="Under Review"
                        value={stats.underReview}
                        // icon="🔍"
                        color="primary"
                    />
                    <StatsCard
                        title="Hired"
                        value={stats.hired}
                        // icon="🎉"
                        color="success"
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-100 p-6 rounded-2xl animate-fade-in shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/jobs')}
                            className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2 text-blue-600">🔍</div>
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                Browse Jobs
                            </h3>
                            <p className="text-sm text-slate-500">Find your next opportunity</p>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/employee/applications')}
                            className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2 text-blue-600">📋</div>
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                My Applications
                            </h3>
                            <p className="text-sm text-slate-500">Track your applications</p>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/employee/profile')}
                            className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition-all text-left group"
                        >
                            <div className="text-2xl mb-2 text-blue-600">👤</div>
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                Update Profile
                            </h3>
                            <p className="text-sm text-slate-500">Keep your info current</p>
                        </button>
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Recent Applications</h2>
                        <button
                            onClick={() => router.push('/dashboard/employee/applications')}
                            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-bold"
                        >
                            View All →
                        </button>
                    </div>

                    {recentApplications.length === 0 ? (
                        <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-sm">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No applications yet</h3>
                            <p className="text-gray-500 mb-6">Start applying to jobs to see them here</p>
                            <button
                                onClick={() => router.push('/jobs')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Browse Jobs
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentApplications.map((application) => (
                                <ApplicationCard key={application._id} application={application} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
