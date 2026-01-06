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
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white border border-slate-200 p-8 rounded-xl animate-pulse shadow-sm">
                        <div className="h-8 bg-slate-100 rounded mb-4 w-1/2"></div>
                        <div className="h-4 bg-slate-100 rounded mb-2 w-1/4"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-sm">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Job not found</h2>
                        <p className="text-gray-500 mb-6">This job posting may have been removed</p>
                        <button
                            onClick={() => router.push('/jobs')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Browse All Jobs
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
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Job Header */}
                <div className="bg-white border border-slate-200 p-8 rounded-xl mb-6 animate-fade-in shadow-sm">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">{job.title}</h1>
                            <p className="text-xl text-slate-600 font-medium mb-4">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-6 text-slate-500">
                                <span className="flex items-center space-x-2">
                                    <span className="text-lg">📍</span>
                                    <span className="font-medium">{job.location}</span>
                                </span>
                                <span className="flex items-center space-x-2">
                                    <span className="text-lg">💼</span>
                                    <span className="font-medium">{employmentTypeLabels[job.employmentType]}</span>
                                </span>
                                <span className="flex items-center space-x-2">
                                    <span className="text-lg">📅</span>
                                    <span className="font-medium">Posted {formattedDate}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {job.salaryRange && job.salaryRange.min && job.salaryRange.max && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Salary Range</p>
                            <p className="text-2xl font-bold text-foreground">
                                {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleApply}
                        className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Apply for this position
                    </button>
                </div>

                {/* Job Description */}
                <div className="bg-white border border-slate-200 p-8 rounded-xl mb-6 animate-fade-in shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Job Description</h2>
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">{job.description}</p>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                    <div className="bg-white border border-slate-200 p-8 rounded-xl mb-6 animate-fade-in shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
                        <ul className="space-y-4">
                            {job.requirements.map((req, index) => (
                                <li key={index} className="flex items-start space-x-3 text-slate-600">
                                    <span className="text-blue-600 font-bold mt-1">✓</span>
                                    <span className="font-medium">{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Company Info */}
                <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl animate-fade-in shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">About the Company</h2>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        This position is posted by <span className="text-slate-900 font-bold">
                            {job.recruiterId?.firstName ? `${job.recruiterId.firstName} ${job.recruiterId.lastName}` : 'Recruiter'}
                        </span> from <span className="text-slate-900 font-bold">
                            {job.recruiterId?.company || job.company}
                        </span>.
                    </p>
                </div>
            </main>
        </div>
    );
}
