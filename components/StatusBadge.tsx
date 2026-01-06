import { ApplicationStatus } from '@/lib/constants';

interface StatusBadgeProps {
    status: ApplicationStatus | string;
    size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { label: string; color: string; icon?: string }> = {
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-50 text-blue-700 border-blue-200',  },
    UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-200',  },
    REFEREE_CONTACTED: { label: 'Referee Contacted', color: 'bg-purple-50 text-purple-700 border-purple-200', },
    VERIFIED: { label: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', },
    REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200',  },
    HIRED: { label: 'Hired', color: 'bg-blue-600 text-white border-blue-600',  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const config = statusConfig[status] || { label: status, color: 'bg-gray-50 text-gray-600 border-gray-100',  };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span className={`inline-flex items-center space-x-1.5 ${sizeClasses[size]} ${config.color} border rounded-full font-medium`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}
