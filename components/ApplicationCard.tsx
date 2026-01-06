import Link from 'next/link';
import StatusBadge from './StatusBadge';

interface ApplicationCardProps {
    application: {
        _id: string;
        jobId: {
            _id: string;
            title: string;
            company: string;
            location: string;
        };
        status: string;
        createdAt: string;
        feedback?: string;
    };
    showJobDetails?: boolean;
}

export default function ApplicationCard({ application, showJobDetails = true }: ApplicationCardProps) {
    const formattedDate = new Date(application.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="glass p-6 rounded-2xl hover:scale-[1.01] transition-all duration-300 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    {showJobDetails && (
                        <>
                            <Link href={`/jobs/${application.jobId._id}`}>
                                <h3 className="text-lg font-bold text-white mb-1 hover:text-purple-300 transition-colors">
                                    {application.jobId.title}
                                </h3>
                            </Link>
                            <p className="text-gray-300 text-sm mb-1">{application.jobId.company}</p>
                            <p className="text-gray-400 text-sm flex items-center space-x-1">
                                <span>📍</span>
                                <span>{application.jobId.location}</span>
                            </p>
                        </>
                    )}
                </div>
                <StatusBadge status={application.status} />
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Applied on {formattedDate}</span>
                <Link
                    href={`/dashboard/employee/applications/${application._id}`}
                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                >
                    View Details →
                </Link>
            </div>

            {application.feedback && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Feedback</p>
                    <p className="text-sm text-gray-300">{application.feedback}</p>
                </div>
            )}
        </div>
    );
}
