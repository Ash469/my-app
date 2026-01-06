'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/constants';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="glass-dark sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 gradient-primary rounded-lg"></div>
                        <span className="text-xl font-bold text-white">RecruitVerify</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        {!user ? (
                            <>
                                <Link
                                    href="/jobs"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Browse Jobs
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/jobs"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Jobs
                                </Link>
                                <Link
                                    href={
                                        user.role === UserRole.EMPLOYEE
                                            ? '/dashboard/employee'
                                            : '/dashboard/recruiter'
                                    }
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-300">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="text-gray-300 hover:text-white transition-colors text-sm"
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
