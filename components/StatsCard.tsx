interface StatsCardProps {
    title: string;
    value: string | number;
    // icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
}

export default function StatsCard({ title, value,  trend, color = 'primary' }: StatsCardProps) {
    const colorClasses = {
        primary: 'bg-blue-50 text-blue-600 border-blue-100',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        error: 'bg-rose-50 text-rose-600 border-rose-100',
        secondary: 'bg-slate-50 text-slate-600 border-slate-100',
    };
    return (
        <div className="bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-md transition-shadow animate-fade-in shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
                    {trend && (
                        <div className={`flex items-center space-x-1 text-sm ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-slate-500">vs last month</span>
                        </div>
                    )}
                </div>
                {/* <div className={`w-12 h-12 ${colorClasses[color]} border rounded-xl flex items-center justify-center text-2xl`}>
                    {icon}
                </div> */}
            </div>
        </div>
    );
}
