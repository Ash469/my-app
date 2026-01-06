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
        <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all duration-300 animate-fade-in shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    {showJobDetails && (
                        <>
                            <Link href={`/jobs/${application.jobId._id}`}>
                                <h3 className="text-lg font-bold text-foreground mb-1 hover:text-primary transition-colors">
                                    {application.jobId.title}
                                </h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-1">{application.jobId.company}</p>
                            <p className="text-gray-500 text-sm flex items-center space-x-1">
                                <span>📍</span>
                                <span>{application.jobId.location}</span>
                            </p>
                        </>
                    )}
                </div>
                <StatusBadge status={application.status} />
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Applied on {formattedDate}</span>
                <Link
                    href={`/dashboard/employee/applications/${application._id}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-bold"
                >
                    View Details →
                </Link>
            </div>

            {application.feedback && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Feedback</p>
                    <p className="text-sm text-gray-600">{application.feedback}</p>
                </div>
            )}
        </div>
    );
}
