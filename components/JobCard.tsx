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
    FULL_TIME: { label: 'Full Time', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    PART_TIME: { label: 'Part Time', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    CONTRACT: { label: 'Contract', color: 'bg-purple-50 text-purple-700 border-purple-100' },
    INTERNSHIP: { label: 'Internship', color: 'bg-amber-50 text-amber-700 border-amber-100' },
};

export default function JobCard({ job }: JobCardProps) {
    const typeConfig = employmentTypeConfig[job.employmentType] || employmentTypeConfig.FULL_TIME;
    const daysAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <Link href={`/jobs/${job._id}`}>
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors tracking-tight">
                            {job.title}
                        </h3>
                        <p className="text-slate-600 font-bold mb-1">{job.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 font-medium">
                            <span className="flex items-center space-x-1">
                                <span>📍</span>
                                <span>{job.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <span className="opacity-70">🕒</span>
                                <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed font-medium">
                    {job.description}
                </p>

                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-xs ${typeConfig.color} border rounded-full font-bold`}>
                        {typeConfig.label}
                    </span>
                    {job.salaryRange && job.salaryRange.min && job.salaryRange.max && (
                        <span className="text-sm font-bold text-slate-900">
                            {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
