import { PlusCircle, Clock, CheckCircle2, AlertCircle, MoreHorizontal, UserPlus, FileText, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

// Mock data
const stats = [
    { label: 'Active Onboardings', value: '12', change: '+2 this week', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: '45', change: '+15% vs last month', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Tasks Overdue', value: '3', change: '-2 from yesterday', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

const activeOnboardings = [
    {
        id: 1,
        name: 'Sarah Cohen',
        role: 'Frontend Developer',
        progress: 65,
        startDate: '2026-01-15',
        status: 'In Progress',
        initials: 'SC',
        avatarColor: 'bg-purple-100 text-purple-700'
    },
    {
        id: 2,
        name: 'Mike Johnson',
        role: 'Product Designer',
        progress: 15,
        startDate: '2026-01-20',
        status: 'Pending',
        initials: 'MJ',
        avatarColor: 'bg-yellow-100 text-yellow-700'
    },
    {
        id: 3,
        name: 'Elise Martin',
        role: 'Growth Manager',
        progress: 90,
        startDate: '2026-01-10',
        status: 'In Progress',
        initials: 'EM',
        avatarColor: 'bg-pink-100 text-pink-700'
    },
    {
        id: 4,
        name: 'David Chen',
        role: 'Backend Developer',
        progress: 0,
        startDate: '2026-01-25',
        status: 'Pending',
        initials: 'DC',
        avatarColor: 'bg-blue-100 text-blue-700'
    }
];

export function DashboardPage() {
    return (
        <div className="space-y-8 animated-content">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your team's onboarding progress and tasks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        Download Report
                    </button>
                    <Link
                        to="/onboarding/new"
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        New Onboarding
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{stat.change}</span>
                                </div>
                            </div>
                            <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Onboardings List - Takes up 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Active Onboardings</h3>
                    <Card>
                        <div className="divide-y divide-gray-100">
                            {activeOnboardings.map((recruit) => (
                                <div key={recruit.id} className="p-5 hover:bg-gray-50 transition-colors flex items-center gap-4 group cursor-pointer">
                                    {/* Avatar */}
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0", recruit.avatarColor)}>
                                        {recruit.initials}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-gray-900 truncate">{recruit.name}</h4>
                                            <span className="text-xs text-gray-400 group-hover:hidden">{new Date(recruit.startDate).toLocaleDateString()}</span>
                                            <button className="hidden group-hover:flex text-gray-400 hover:text-gray-600">
                                                <span className="text-xs font-medium mr-1">View</span> <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{recruit.role}</p>
                                    </div>

                                    {/* Status & Progress */}
                                    <div className="w-32 hidden sm:block">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <Badge variant={recruit.status === 'In Progress' ? 'default' : 'neutral'}>
                                                {recruit.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", recruit.progress === 100 ? "bg-green-500" : "bg-blue-600")}
                                                    style={{ width: `${recruit.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600 w-8 text-right">{recruit.progress}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl text-center">
                            <button className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:underline">View all active onboardings</button>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions / Recent Activity - Takes up 1 column */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <button className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 hover:ring-1 hover:ring-blue-100 transition-all text-left">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Add New Member</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Invite a team member</p>
                            </div>
                        </button>
                        <button className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-purple-300 hover:ring-1 hover:ring-purple-100 transition-all text-left">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Create Template</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Automate your checklists</p>
                            </div>
                        </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 pt-4">Recent Activity</h3>
                    <Card>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900"><span className="font-semibold">Sarah Cohen</span> completed <span className="font-medium">Sign Contract</span></p>
                                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <UserPlus className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900"><span className="font-semibold">Mike Johnson</span> started onboarding</p>
                                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">New template <span className="font-medium">Dev Junior</span> created</p>
                                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
