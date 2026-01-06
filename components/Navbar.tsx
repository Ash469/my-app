'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/constants';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors"></div>
                        <span className="text-xl font-bold text-slate-900">RecruitVerify</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        {!user ? (
                            <>
                                <Link
                                    href="/jobs"
                                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Browse Jobs
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/jobs"
                                    className="text-gray-600 hover:text-primary transition-colors"
                                >
                                    Jobs
                                </Link>
                                <Link
                                    href={
                                        user.role === UserRole.EMPLOYEE
                                            ? '/dashboard/employee'
                                            : '/dashboard/recruiter'
                                    }
                                    className="text-gray-600 hover:text-primary transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="text-gray-600 hover:text-error transition-colors text-sm"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
