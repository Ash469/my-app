'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/constants';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isRecruiter = user?.role === UserRole.RECRUITER;
    const isEmployee = user?.role === UserRole.EMPLOYEE;

    const recruiterLinks = [
        { href: '/dashboard/recruiter', label: 'Overview', icon: '📊' },
        { href: '/dashboard/recruiter/jobs', label: 'My Jobs', icon: '💼' },
        { href: '/dashboard/recruiter/applications', label: 'Applications', icon: '📋' },
    ];

    const employeeLinks = [
        { href: '/dashboard/employee', label: 'Overview', icon: '📊' },
        { href: '/dashboard/employee/applications', label: 'My Applications', icon: '📝' },
        { href: '/jobs', label: 'Browse Jobs', icon: '🔍' },
    ];

    const links = isRecruiter ? recruiterLinks : employeeLinks;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            {/* Header */}
            <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 gradient-primary rounded-lg"></div>
                            <span className="text-xl font-bold text-white">RecruitVerify</span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-white">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {isRecruiter ? 'Recruiter' : 'Employee'}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="text-gray-300 hover:text-white transition-colors text-sm px-3 py-1.5 glass rounded-lg"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="glass p-4 rounded-2xl space-y-2 sticky top-24">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'gradient-primary text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="text-xl">{link.icon}</span>
                                        <span className="font-medium">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
