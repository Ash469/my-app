import { ApplicationStatus } from '@/lib/constants';

interface StatusBadgeProps {
    status: ApplicationStatus | string;
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '📤' },
    UNDER_REVIEW: { label: 'Under Review', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '🔍' },
    REFEREE_CONTACTED: { label: 'Referee Contacted', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '📞' },
    VERIFIED: { label: 'Verified', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅' },
    REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌' },
    HIRED: { label: 'Hired', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '🎉' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const config = statusConfig[status] || { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: '📋' };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span className={`inline-flex items-center space-x-1.5 ${sizeClasses[size]} ${config.color} border rounded-full font-medium backdrop-blur-sm`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}
