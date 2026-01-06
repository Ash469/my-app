'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';

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
    createdAt: string;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchJobs();
    }, [search, location, employmentType, page]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
            });

            if (search) params.append('search', search);
            if (location) params.append('location', location);
            if (employmentType) params.append('employmentType', employmentType);

            const response = await fetch(`/api/jobs?${params}`);
            const data = await response.json();

            setJobs(data.jobs);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchJobs();
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-5xl font-bold text-foreground mb-4">
                        Find Your Next
                        <span className="block text-blue-600">
                            Dream Job
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Browse through {jobs.length > 0 ? 'thousands of' : ''} verified job opportunities
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white border border-gray-100 p-6 rounded-2xl mb-8 animate-fade-in shadow-sm">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        <select
                            value={employmentType}
                            onChange={(e) => setEmploymentType(e.target.value)}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none"
                        >
                            <option value="">All Types</option>
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="CONTRACT">Contract</option>
                            <option value="INTERNSHIP">Internship</option>
                        </select>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Search Jobs
                        </button>
                    </form>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl h-64 animate-pulse shadow-sm">
                                <div className="h-6 bg-slate-100 rounded mb-4"></div>
                                <div className="h-4 bg-slate-100 rounded mb-2"></div>
                                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-sm">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">No jobs found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {jobs.map((job) => (
                                <JobCard key={job._id} job={job} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold shadow-sm"
                                >
                                    Previous
                                </button>
                                <span className="text-slate-600 px-4 font-medium">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
