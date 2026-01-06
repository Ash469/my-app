'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function NewJobPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: user?.company || '',
        description: '',
        requirements: [''],
        location: '',
        employmentType: 'FULL_TIME',
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const jobData = {
                title: formData.title,
                company: formData.company,
                description: formData.description,
                requirements: formData.requirements.filter(req => req.trim() !== ''),
                location: formData.location,
                employmentType: formData.employmentType,
                ...(formData.salaryMin && formData.salaryMax && {
                    salaryRange: {
                        min: parseInt(formData.salaryMin),
                        max: parseInt(formData.salaryMax),
                        currency: formData.currency,
                    },
                }),
            };

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(jobData),
            });

            if (response.ok) {
                router.push('/dashboard/recruiter/jobs');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create job');
            }
        } catch (error) {
            console.error('Error creating job:', error);
            alert('Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    const addRequirement = () => {
        setFormData({ ...formData, requirements: [...formData.requirements, ''] });
    };

    const updateRequirement = (index: number, value: string) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index] = value;
        setFormData({ ...formData, requirements: newRequirements });
    };

    const removeRequirement = (index: number) => {
        const newRequirements = formData.requirements.filter((_, i) => i !== index);
        setFormData({ ...formData, requirements: newRequirements });
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Post New Job</h1>
                    <p className="text-gray-500">Create a new job listing to attract qualified candidates</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                placeholder="e.g. Senior Software Engineer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                placeholder="Your company name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                placeholder="e.g. San Francisco, CA or Remote"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Employment Type *
                            </label>
                            <select
                                required
                                value={formData.employmentType}
                                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gray-100"
                            >
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>
                    </div>

                    {/* Salary Range */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Salary Range (Optional)</h2>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum
                                </label>
                                <input
                                    type="number"
                                    value={formData.salaryMin}
                                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                    placeholder="50000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum
                                </label>
                                <input
                                    type="number"
                                    value={formData.salaryMax}
                                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                    placeholder="100000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gray-100"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="INR">INR</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Job Description *</h2>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                            placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                        />
                    </div>

                    {/* Requirements */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-foreground">Requirements</h2>
                            <button
                                type="button"
                                onClick={addRequirement}
                                className="px-4 py-2 bg-gray-100 border border-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors text-sm font-semibold"
                            >
                                + Add Requirement
                            </button>
                        </div>

                        {formData.requirements.map((req, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => updateRequirement(index, e.target.value)}
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                    placeholder="e.g. 5+ years of experience in React"
                                />
                                {formData.requirements.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRequirement(index)}
                                        className="px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center space-x-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary/20 text-primary border border-primary/20 px-8 py-4 rounded-lg text-lg font-bold hover:bg-primary/30 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Post Job'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-8 py-4 bg-gray-100 text-gray-700 border border-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
