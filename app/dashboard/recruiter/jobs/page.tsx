'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    status: string;
    createdAt: string;
    applicationsCount?: number;
}

export default function RecruiterJobsPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        fetchJobs();
    }, [user]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/jobs/my-jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data.jobs || []);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setJobs(jobs.filter(job => job._id !== jobId));
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job');
        }
    };

    const employmentTypeLabels: Record<string, string> = {
        FULL_TIME: 'Full Time',
        PART_TIME: 'Part Time',
        CONTRACT: 'Contract',
        INTERNSHIP: 'Internship',
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Job Postings</h1>
                        <p className="text-gray-400">Manage your job listings and track applications</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/recruiter/jobs/new')}
                        className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        + Post New Job
                    </button>
                </div>

                {/* Jobs List */}
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
                ) : jobs.length === 0 ? (
                    <div className="glass p-12 rounded-2xl text-center">
                        <div className="text-6xl mb-4">💼</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No jobs posted yet</h3>
                        <p className="text-gray-400 mb-6">Create your first job posting to start receiving applications</p>
                        <button
                            onClick={() => router.push('/dashboard/recruiter/jobs/new')}
                            className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div key={job._id} className="glass p-6 rounded-2xl hover:scale-[1.01] transition-all animate-fade-in">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{job.title}</h3>
                                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${job.status === 'ACTIVE'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 mb-2">{job.company}</p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center space-x-1">
                                                <span>📍</span>
                                                <span>{job.location}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <span>💼</span>
                                                <span>{employmentTypeLabels[job.employmentType]}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <span>📝</span>
                                                <span>{job.applicationsCount || 0} applications</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <span>📅</span>
                                                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Link
                                            href={`/jobs/${job._id}`}
                                            className="px-4 py-2 glass rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/dashboard/recruiter/jobs/${job._id}/edit`}
                                            className="px-4 py-2 glass rounded-lg text-white hover:bg-white/20 transition-colors text-sm"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteJob(job._id)}
                                            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
