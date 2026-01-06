'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeeProfilePage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        position: '',
        bio: '',
        skills: [] as string[],
        yearsOfExperience: 0,
        education: {
            degree: '',
            institution: '',
            year: undefined as number | undefined,
        },
        linkedIn: '',
        portfolio: '',
    });
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        if (!token) return;
        fetchProfile();
    }, [user, token]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    firstName: data.user.firstName || '',
                    lastName: data.user.lastName || '',
                    phone: data.user.phone || '',
                    position: data.user.position || '',
                    bio: data.user.bio || '',
                    skills: data.user.skills || [],
                    yearsOfExperience: data.user.yearsOfExperience || 0,
                    education: data.user.education || { degree: '', institution: '', year: undefined },
                    linkedIn: data.user.linkedIn || '',
                    portfolio: data.user.portfolio || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Profile updated successfully!');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skillInput.trim()],
            });
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skill),
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                    <div className="bg-white border border-slate-200 p-6 rounded-xl h-96 shadow-sm"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
                    <p className="text-slate-500 font-medium">Manage your professional information</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Professional Details</h2>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Current Position
                            </label>
                            <input
                                type="text"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="e.g. Senior Software Engineer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Years of Experience
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.yearsOfExperience}
                                onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Bio
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Tell us about yourself..."
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Skills</h2>

                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Add a skill (e.g. React, Python)"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-bold flex items-center space-x-2"
                                >
                                    <span>{skill}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(skill)}
                                        className="text-blue-400 hover:text-blue-600 ml-1"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Education</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Degree
                            </label>
                            <input
                                type="text"
                                value={formData.education.degree}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    education: { ...formData.education, degree: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                placeholder="e.g. Bachelor of Science in Computer Science"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Institution
                            </label>
                            <input
                                type="text"
                                value={formData.education.institution}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    education: { ...formData.education, institution: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                placeholder="e.g. Stanford University"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Graduation Year
                            </label>
                            <input
                                type="number"
                                min="1950"
                                max="2030"
                                value={formData.education.year || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    education: { ...formData.education, year: parseInt(e.target.value) || undefined }
                                })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                placeholder="2020"
                            />
                        </div>
                    </div>

                    {/* Links */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4 animate-fade-in shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-4">Links</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LinkedIn Profile
                            </label>
                            <input
                                type="url"
                                value={formData.linkedIn}
                                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                placeholder="https://linkedin.com/in/yourprofile"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Portfolio Website
                            </label>
                            <input
                                type="url"
                                value={formData.portfolio}
                                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                                placeholder="https://yourportfolio.com"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center space-x-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
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
