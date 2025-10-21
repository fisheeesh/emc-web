import { Badge } from "../ui/badge";
import {
    Smile, Meh, Frown, AlertTriangle, TrendingUp, Minus, TrendingDown,
    Shield, ShieldCheck, Crown, CheckCircle2, Pause, Clock, Briefcase,
    FileText, GraduationCap, Loader
} from "lucide-react";

interface BadgeConfig {
    icon: React.ReactNode;
    label: string;
    className: string;
}

const getBadgeConfig = (value: string): BadgeConfig => {
    const normalizedValue = value.toUpperCase();

    const configs: Record<string, BadgeConfig> = {
        //* Emotion & Priority
        'POSITIVE': {
            icon: <Smile className="size-3.5" />,
            label: 'Positive',
            className: 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400'
        },
        'NEUTRAL': {
            icon: <Meh className="size-3.5" />,
            label: 'Neutral',
            className: 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
        },
        'NEGATIVE': {
            icon: <Frown className="size-3.5" />,
            label: 'Negative',
            className: 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
        },
        'CRITICAL': {
            icon: <AlertTriangle className="size-3.5" />,
            label: 'Critical',
            className: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400'
        },
        'HIGH': {
            icon: <TrendingUp className="size-3.5" />,
            label: 'High',
            className: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400'
        },
        'MEDIUM': {
            icon: <Minus className="size-3.5" />,
            label: 'Medium',
            className: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
        },
        'LOW': {
            icon: <TrendingDown className="size-3.5" />,
            label: 'Low',
            className: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
        },

        //* Role
        'EMPLOYEE': {
            icon: <Shield className="size-3.5" />,
            label: 'Employee',
            className: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
        },
        'ADMIN': {
            icon: <ShieldCheck className="size-3.5" />,
            label: 'Admin',
            className: 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
        },
        'SUPERADMIN': {
            icon: <Crown className="size-3.5" />,
            label: 'Super Admin',
            className: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
        },

        //* Account Types
        'ACTIVE': {
            icon: <CheckCircle2 className="size-3.5" />,
            label: 'Active',
            className: 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400'
        },
        'FREEZE': {
            icon: <Pause className="size-3.5" />,
            label: 'Freeze',
            className: 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-950/30 dark:text-gray-400'
        },

        //* Job Types
        'FULLTIME': {
            icon: <Briefcase className="size-3.5" />,
            label: 'Full-time',
            className: 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
        },
        'PARTTIME': {
            icon: <Clock className="size-3.5" />,
            label: 'Part-time',
            className: 'border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400'
        },
        'CONTRACT': {
            icon: <FileText className="size-3.5" />,
            label: 'Contract',
            className: 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
        },
        'INTERNSHIP': {
            icon: <GraduationCap className="size-3.5" />,
            label: 'Internship',
            className: 'border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-700 dark:bg-pink-950/30 dark:text-pink-400'
        },

        //* Action Status
        'PENDING': {
            icon: <Loader className="size-3.5" />,
            label: 'Pending',
            className: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
        },
        'PROCESSING': {
            icon: <Loader className="size-3.5" />,
            label: 'Processing',
            className: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
        },
        'COMPLETED': {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
            ),
            label: 'Completed',
            className: 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400'
        },
        'APPROVED': {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
            ),
            label: 'Approved',
            className: 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400'
        },
        'FAILED': {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                </svg>
            ),
            label: 'Failed',
            className: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400'
        },
        'REJECTED': {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                </svg>
            ),
            label: 'Rejected',
            className: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400'
        }
    };

    return configs[normalizedValue] || {
        icon: null,
        label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
        className: 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400'
    };
};

export default function CustomBadge({ value }: { value: BadgeType | string }) {
    const config = getBadgeConfig(value);

    return (
        <Badge
            variant="outline"
            className={`flex items-center gap-1.5 w-fit whitespace-nowrap ${config.className}`}
        >
            {config.icon}
            <span className="text-xs font-medium">{config.label}</span>
        </Badge>
    );
}