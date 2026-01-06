'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, REFEREE_RELATIONSHIPS } from '@/lib/constants';

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
}

interface Referee {
    name: string;
    email: string;
    phone: string;
    relationship: string;
    company: string;
    position: string;
}

export default function ApplyJobPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        resumeUrl: '',
        coverLetter: '',
    });

    const [referees, setReferees] = useState<Referee[]>([
        { name: '', email: '', phone: '', relationship: 'Manager', company: '', position: '' }
    ]);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        if (user.role !== UserRole.EMPLOYEE) {
            alert('Only employees can apply for jobs');
            router.push(`/jobs/${params.id}`);
            return;
        }
        fetchJob();
    }, [user]);

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

    const addReferee = () => {
        if (referees.length < 3) {
            setReferees([...referees, { name: '', email: '', phone: '', relationship: 'Manager', company: '', position: '' }]);
        }
    };

    const removeReferee = (index: number) => {
        if (referees.length > 1) {
            setReferees(referees.filter((_, i) => i !== index));
        }
    };

    const updateReferee = (index: number, field: keyof Referee, value: string) => {
        const updated = [...referees];
        updated[index] = { ...updated[index], [field]: value };
        setReferees(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.resumeUrl.trim()) {
            alert('Please provide your resume URL');
            return;
        }

        // Validate at least one referee
        const validReferees = referees.filter(r => r.name && r.email);
        if (validReferees.length === 0) {
            alert('Please add at least one referee');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/api/jobs/${params.id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    referees: validReferees,
                }),
            });

            if (response.ok) {
                alert('Application submitted successfully!');
                router.push('/dashboard/employee/applications');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !formData.resumeUrl.trim()) {
            alert('Please provide your resume URL');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="glass p-8 rounded-2xl animate-pulse">
                        <div className="h-8 bg-white/10 rounded mb-4"></div>
                        <div className="h-4 bg-white/10 rounded mb-2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-white mb-2">Apply for Position</h1>
                    <p className="text-gray-400">
                        {job.title} at {job.company}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="glass p-4 rounded-2xl mb-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'gradient-primary text-white' : 'bg-white/10 text-gray-400'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-white/10'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                        <span className={step >= 1 ? 'text-white' : 'text-gray-400'}>Resume</span>
                        <span className={step >= 2 ? 'text-white' : 'text-gray-400'}>Referees</span>
                        <span className={step >= 3 ? 'text-white' : 'text-gray-400'}>Review</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Resume & Cover Letter */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="glass p-6 rounded-2xl">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Resume URL *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.resumeUrl}
                                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://drive.google.com/your-resume"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    💡 Upload your resume to Google Drive, Dropbox, or your website
                                </p>
                            </div>

                            <div className="glass p-6 rounded-2xl">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Cover Letter (Optional)
                                </label>
                                <textarea
                                    value={formData.coverLetter}
                                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Tell us why you're a great fit..."
                                />
                            </div>

                            <button
                                type="button"
                                onClick={nextStep}
                                className="w-full gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
                            >
                                Next: Add Referees →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Referees */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="glass p-6 rounded-2xl">
                                <h2 className="text-xl font-bold text-white mb-4">Professional Referees</h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    Add 1-3 professional references who can vouch for your work experience
                                </p>

                                {referees.map((referee, index) => (
                                    <div key={index} className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-white">Referee {index + 1}</h3>
                                            {referees.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeReferee(index)}
                                                    className="text-red-400 hover:text-red-300 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={referee.name}
                                                    onChange={(e) => updateReferee(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={referee.email}
                                                    onChange={(e) => updateReferee(index, 'email', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="john@company.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={referee.phone}
                                                    onChange={(e) => updateReferee(index, 'phone', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Relationship *</label>
                                                <select
                                                    value={referee.relationship}
                                                    onChange={(e) => updateReferee(index, 'relationship', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    {REFEREE_RELATIONSHIPS.map((rel) => (
                                                        <option key={rel} value={rel}>{rel}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Company</label>
                                                <input
                                                    type="text"
                                                    value={referee.company}
                                                    onChange={(e) => updateReferee(index, 'company', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Company Name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Position</label>
                                                <input
                                                    type="text"
                                                    value={referee.position}
                                                    onChange={(e) => updateReferee(index, 'position', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Engineering Manager"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {referees.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={addReferee}
                                        className="w-full py-3 glass rounded-lg text-white hover:bg-white/20 transition-colors"
                                    >
                                        + Add Another Referee
                                    </button>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 glass text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex-1 gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Next: Review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="glass p-6 rounded-2xl">
                                <h2 className="text-xl font-bold text-white mb-4">Review Your Application</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-1">Resume</h3>
                                        <p className="text-white break-all">{formData.resumeUrl}</p>
                                    </div>

                                    {formData.coverLetter && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-400 mb-1">Cover Letter</h3>
                                            <p className="text-white whitespace-pre-line">{formData.coverLetter}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Referees ({referees.filter(r => r.name && r.email).length})</h3>
                                        {referees.filter(r => r.name && r.email).map((referee, index) => (
                                            <div key={index} className="mb-2 p-3 bg-white/5 rounded-lg">
                                                <p className="text-white font-medium">{referee.name}</p>
                                                <p className="text-sm text-gray-400">{referee.email} • {referee.relationship}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 glass text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 gradient-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
