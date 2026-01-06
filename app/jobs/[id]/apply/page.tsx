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
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white border border-slate-200 p-8 rounded-xl animate-pulse shadow-sm">
                        <div className="h-8 bg-slate-100 rounded mb-4 w-1/2"></div>
                        <div className="h-4 bg-slate-100 rounded mb-2 w-1/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white border border-slate-200 p-12 rounded-xl text-center shadow-sm">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h2>
                        <p className="text-slate-500 mb-6">This job posting may have been removed</p>
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

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8 animate-fade-in text-center md:text-left">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Apply for Position</h1>
                    <p className="text-slate-500 font-medium">
                        {job.title} at <span className="text-blue-600 font-bold">{job.company}</span>
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white border border-slate-200 p-6 rounded-xl mb-6 animate-fade-in shadow-sm">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm border ${step >= s ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-200'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 rounded ${step > s ? 'bg-blue-600' : 'bg-slate-100'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 text-sm font-bold">
                        <span className={step >= 1 ? 'text-slate-900' : 'text-slate-400'}>Resume</span>
                        <span className={step >= 2 ? 'text-slate-900' : 'text-slate-400'}>Referees</span>
                        <span className={step >= 3 ? 'text-slate-900' : 'text-slate-400'}>Review</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Resume & Cover Letter */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resume URL *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.resumeUrl}
                                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                    placeholder="https://drive.google.com/your-resume"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 Upload your resume to Google Drive, Dropbox, or your website
                                </p>
                            </div>

                            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Letter (Optional)
                                </label>
                                <textarea
                                    value={formData.coverLetter}
                                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                    placeholder="Tell us why you're a great fit..."
                                />
                            </div>

                            <button
                                type="button"
                                onClick={nextStep}
                                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                            >
                                Next: Add Referees →
                            </button>
                        </div>
                    )}

                    {/* Step 2: Referees */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-foreground mb-4">Professional Referees</h2>
                                <p className="text-gray-500 text-sm mb-6">
                                    Add 1-3 professional references who can vouch for your work experience
                                </p>

                                {referees.map((referee, index) => (
                                    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-foreground">Referee {index + 1}</h3>
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
                                                <label className="block text-xs text-gray-500 mb-1">Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={referee.name}
                                                    onChange={(e) => updateReferee(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gray-100"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={referee.email}
                                                    onChange={(e) => updateReferee(index, 'email', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gray-100"
                                                    placeholder="john@company.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={referee.phone}
                                                    onChange={(e) => updateReferee(index, 'phone', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gray-100"
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Relationship *</label>
                                                <select
                                                    value={referee.relationship}
                                                    onChange={(e) => updateReferee(index, 'relationship', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gray-100"
                                                >
                                                    {REFEREE_RELATIONSHIPS.map((rel) => (
                                                        <option key={rel} value={rel}>{rel}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Company</label>
                                                <input
                                                    type="text"
                                                    value={referee.company}
                                                    onChange={(e) => updateReferee(index, 'company', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gray-100"
                                                    placeholder="Company Name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Position</label>
                                                <input
                                                    type="text"
                                                    value={referee.position}
                                                    onChange={(e) => updateReferee(index, 'position', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gray-100"
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
                                        className="w-full py-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        + Add Another Referee
                                    </button>
                                )}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                >
                                    Next: Review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Review Your Application</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resume URL</h3>
                                        <p className="text-slate-900 font-bold break-all bg-slate-50 p-3 rounded-lg border border-slate-100">{formData.resumeUrl}</p>
                                    </div>

                                    {formData.coverLetter && (
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cover Letter</h3>
                                            <p className="text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed font-medium">{formData.coverLetter}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Professional Referees ({referees.filter(r => r.name && r.email).length})</h3>
                                        <div className="space-y-3">
                                            {referees.filter(r => r.name && r.email).map((referee, index) => (
                                                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                    <p className="text-slate-900 font-bold">{referee.name}</p>
                                                    <p className="text-sm text-slate-500 font-medium">{referee.email} • {referee.relationship}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-lg text-lg font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
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
