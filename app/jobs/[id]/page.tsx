'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/constants';

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    salaryRange?: {
        min: number;
        max: number;
        currency: string;
    };
    description: string;
    requirements: string[];
    createdAt: string;
    recruiterId: {
        firstName: string;
        lastName: string;
        company: string;
    };
}

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchJob();
    }, [params.id]);

    const fetchJob = async () => {
        try {
            const response = await fetch(`/api/jobs/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setJob(data.job);
            }
        } catch (error) {
            console.error('Error fetching job:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        if (user.role !== UserRole.EMPLOYEE) {
            alert('Only employees can apply for jobs');
            return;
        }
        // Navigate to application form
        router.push(`/jobs/${params.id}/apply`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="glass p-8 rounded-2xl animate-pulse">
                        <div className="h-8 bg-white/10 rounded mb-4"></div>
                        <div className="h-4 bg-white/10 rounded mb-2"></div>
                        <div className="h-4 bg-white/10 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="glass p-12 rounded-2xl text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Job not found</h2>
                        <p className="text-gray-400 mb-6">This job posting may have been removed</p>
                        <button
                            onClick={() => router.push('/jobs')}
                            className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Browse Jobs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const employmentTypeLabels: Record<string, string> = {
        FULL_TIME: 'Full Time',
        PART_TIME: 'Part Time',
        CONTRACT: 'Contract',
        INTERNSHIP: 'Internship',
    };

    const formattedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Job Header */}
                <div className="glass p-8 rounded-2xl mb-6 animate-fade-in">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-3">{job.title}</h1>
                            <p className="text-xl text-gray-300 mb-2">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-4 text-gray-400">
                                <span className="flex items-center space-x-1">
                                    <span>📍</span>
                                    <span>{job.location}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <span>💼</span>
                                    <span>{employmentTypeLabels[job.employmentType]}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <span>📅</span>
                                    <span>Posted {formattedDate}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {job.salaryRange && job.salaryRange.min && job.salaryRange.max && (
                        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-sm text-gray-400 mb-1">Salary Range</p>
                            <p className="text-2xl font-bold text-white">
                                {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleApply}
                        className="w-full gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        Apply Now
                    </button>
                </div>

                {/* Job Description */}
                <div className="glass p-8 rounded-2xl mb-6 animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-4">Job Description</h2>
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">{job.description}</p>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                    <div className="glass p-8 rounded-2xl mb-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
                        <ul className="space-y-3">
                            {job.requirements.map((req, index) => (
                                <li key={index} className="flex items-start space-x-3 text-gray-300">
                                    <span className="text-purple-400 mt-1">✓</span>
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Company Info */}
                <div className="glass p-8 rounded-2xl animate-fade-in">
                    <h2 className="text-2xl font-bold text-white mb-4">About the Company</h2>
                    <p className="text-gray-300">
                        This position is posted by {job.recruiterId.firstName} {job.recruiterId.lastName} from {job.recruiterId.company}.
                    </p>
                </div>
            </main>
        </div>
    );
}
