interface StatsCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient?: string;
}

export default function StatsCard({ title, value, icon, trend, gradient = 'gradient-primary' }: StatsCardProps) {
    return (
        <div className="glass p-6 rounded-2xl hover:scale-105 transition-transform animate-fade-in">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-white mb-2">{value}</p>
                    {trend && (
                        <div className={`flex items-center space-x-1 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-gray-400">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
