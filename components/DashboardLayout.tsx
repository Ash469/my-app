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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors"></div>
                            <span className="text-xl font-bold text-slate-900">RecruitVerify</span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-800">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {isRecruiter ? 'Recruiter' : 'Employee'}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="text-slate-600 hover:text-rose-600 transition-colors text-sm px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
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
                        <nav className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 sticky top-24 shadow-sm">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-blue-50 text-blue-700 font-bold'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
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
