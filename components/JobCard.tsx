import Link from 'next/link';

interface JobCardProps {
    job: {
        _id: string;
        title: string;
        company: string;
        location: string;
        employmentType: string;
        salaryRange?: {
            min: number;
            max: number;
            currency: string;
        };
        description: string;
        createdAt: string;
    };
}

const employmentTypeConfig: Record<string, { label: string; color: string }> = {
    FULL_TIME: { label: 'Full Time', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    PART_TIME: { label: 'Part Time', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    CONTRACT: { label: 'Contract', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    INTERNSHIP: { label: 'Internship', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
};

export default function JobCard({ job }: JobCardProps) {
    const typeConfig = employmentTypeConfig[job.employmentType] || employmentTypeConfig.FULL_TIME;
    const daysAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <Link href={`/jobs/${job._id}`}>
            <div className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-gray-300 font-medium mb-1">{job.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                                <span>📍</span>
                                <span>{job.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <span>🕒</span>
                                <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {job.description}
                </p>

                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs ${typeConfig.color} border rounded-full font-medium backdrop-blur-sm`}>
                        {typeConfig.label}
                    </span>
                    {job.salaryRange && job.salaryRange.min && job.salaryRange.max && (
                        <span className="text-sm font-semibold text-white">
                            {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
