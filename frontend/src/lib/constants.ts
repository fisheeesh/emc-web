
export const APP_NAME = "Emotion Check-in System"
export const LOGIN = "Log In"
export const REGISTER = "Register"
export const LOGIN_TITLE = "Welcome aboard"
export const LOGIN_SUBTITLE = "Nurture your team's emotional resilience."
export const IMG_URL = import.meta.env.VITE_IMG_URL

export const SUPER_NAVLINKS = [
    { to: "dashboard/sentiments", name: "Sentiments Dashboard" },
    { to: "dashboard/attendance", name: "Attendance Dashboard" },
    { to: "dashboard/analytics", name: "Analytics Dashboard" },
    { to: "dashboard/managements", name: "General Mangements" },
]

export const ADMIN_NAVLINKS = [
    { to: "dashboard/sentiments", name: "Sentiments Dashboard" },
    { to: "dashboard/attendance", name: "Attendance Dashboard" },
]

export const COMMON_DATAS: CommonData[] = [
    {
        label: 'Positive',
        color: '#22c55e'
    },
    {
        label: 'Neutral',
        color: '#a855f7',
    },
    {
        label: 'Negative',
        color: '#f97316',
    },
    {
        label: 'Critical',
        color: '#ef4444'
    }
];

export const OVERVIEW_FILTER = [
    { name: 'Today', value: '1' },
    { name: 'Last 7 days', value: '7' },
    { name: 'This Month', value: '30' },
]

export const LEADERBOARD_FILTER = [
    { name: "All Time", value: "all" },
    { name: 'For This Month', value: '30' },
    { name: 'For This Week', value: '7' },
]

export const WORDS_FILTERS = [
    { name: 'Last 7 days', value: '7' },
    { name: 'Last 30 days', value: '30' },
    { name: 'Last 3 months', value: '90' },
]

export const CRITICALSTATUS = [
    { name: "All Status", value: "all" },
    { name: "Resolved", value: "RESOLVED" },
    { name: "Unresolved", value: "UNRESOLVED" }
]

export const COMPARISON_FILTER = [
    { name: "Last 7 days", value: "7" },
    { name: "Last 30 days", value: "30" }
]

export const TSFILTER = [
    { name: "Recent", value: "desc" },
    { name: "Earliest", value: "asc" }
]

export const ROLES_FILTER = [
    { name: "All Roles", value: "all" },
    { name: "Super Admin", value: "SUPERADMIN" },
    { name: "Admin", value: "ADMIN" },
    { name: "Employee", value: "EMPLOYEE" }
]

export const ACC_FILTER = [
    { name: "All Acc. Types", value: "all" },
    { name: "Active", value: "ACTIVE" },
    { name: "Freeze", value: "FREEZE" }
]

export const JOBS_FILTER = [
    { name: "All Job Types", value: "all" },
    { name: "Full-time", value: "FULLTIME" },
    { name: "Part-time", value: "PARTTIME" },
    { name: "Contract", value: "CONTRACT" },
    { name: "Internship", value: "INTERNSHIP" }
]

export const EMOTION_FILTER = [
    { name: 'All Emotions', value: 'all' },
    { name: 'Positive', value: 'positive' },
    { name: 'Neutral', value: 'neutral' },
    { name: 'Negative', value: 'negative' },
    { name: 'Critical', value: 'critical' },
]

export const PRIORITY = [
    { name: "All Priority", value: "all" },
    { name: "High", value: "HIGH" },
    { name: "Medium", value: "MEDIUM" },
    { name: "Low", value: "LOW" }
]

export const RSTATUS = [
    { name: "All Status", value: "all" },
    { name: "Pending", value: "PENDING" },
    { name: "Approved", value: "APPROVED" },
    { name: "Rejected", value: "REJECTED" }
]

export const RType = [
    { name: "All Type", value: "all" },
    { name: "Pending", value: "PENDING" },
    { name: "Processing", value: "PROCESSING" },
    { name: "Completed", value: "COMPLETED" },
    { name: "Failed", value: "FAILED" }
]

export const ACTION_STATUS = [
    { name: "Pending", "value": "PENDING" },
    { name: "Approved", value: "APPROVED" },
    { name: "Rejected", value: "REJECTED" }
]