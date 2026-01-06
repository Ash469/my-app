'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/constants';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        company: '',
        position: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await register({ ...formData, role });
            router.push(role === UserRole.EMPLOYEE ? '/dashboard/employee' : '/dashboard/recruiter');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-white border border-gray-100 max-w-md w-full p-8 rounded-2xl animate-fade-in shadow-sm">
                <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
                <p className="text-gray-500 mb-6">Join our recruitment platform</p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            I am a
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole(UserRole.EMPLOYEE)}
                                className={`p-3 rounded-lg border-2 transition-all ${role === UserRole.EMPLOYEE
                                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                                    : 'border-gray-100 text-gray-500 hover:border-gray-100'
                                    }`}
                            >
                                Job Seeker
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole(UserRole.RECRUITER)}
                                className={`p-3 rounded-lg border-2 transition-all ${role === UserRole.RECRUITER
                                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                                    : 'border-gray-100 text-gray-500 hover:border-gray-100'
                                    }`}
                            >
                                Recruiter
                            </button>
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Phone (Optional)
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Role-specific fields */}
                    {role === UserRole.RECRUITER && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                            />
                        </div>
                    )}

                    {role === UserRole.EMPLOYEE && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Current Position (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
