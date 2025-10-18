
export const APP_NAME = "Emotion Check-in System"
export const LOGIN = "Log In"
export const REGISTER = "Register"
export const LOGIN_TITLE = "Welcome aboard"
export const LOGIN_SUBTITLE = "Nurture your team's emotional resilience."
export const IMG_URL = import.meta.env.VITE_IMG_URL

export const NAVLINKS = [
    { to: "dashboard/sentiments", name: "Sentiments Dashboard" },
    { to: "dashboard/attendance", name: "Attendance Dashboard" },
    { to: "dashboard/managements", name: "Mangements" },
]

export const DEPARTMENTS_FILTER = [
    { name: "IT", value: "IT" },
    { name: "HR", value: "HR" },
    { name: "Sales", value: "Sales" },
    { name: "Marketing", value: "Marketing" },
    { name: "Finance", value: "Finance" },
]

export const COMMON_DATAS: CommonData[] = [
    {
        label: 'Positive',
        color: '#22c55e'
    },
    {
        label: 'Neutral',
        color: '#3b82f6'
    },
    {
        label: 'Negative',
        color: '#eab308'
    },
    {
        label: 'Critical',
        color: '#dc2626'
    }
];


export const COMPARISON_DATA: ComparisonData[] = [
    { checkInDate: "2023-01-01", positive: 10, neutral: 5, negative: 2, critical: 1 },
    { checkInDate: "2023-01-02", positive: 8, neutral: 6, negative: 3, critical: 1 },
    { checkInDate: "2023-01-03", positive: 12, neutral: 4, negative: 2, critical: 2 },
    { checkInDate: "2023-01-04", positive: 9, neutral: 5, negative: 3, critical: 1 },
    { checkInDate: "2023-01-05", positive: 11, neutral: 3, negative: 2, critical: 2 },
    { checkInDate: "2023-01-06", positive: 10, neutral: 4, negative: 3, critical: 1 },
    { checkInDate: "2023-01-07", positive: 9, neutral: 5, negative: 2, critical: 2 },
    { checkInDate: "2023-01-08", positive: 11, neutral: 3, negative: 2, critical: 1 },
    { checkInDate: "2023-01-09", positive: 10, neutral: 4, negative: 3, critical: 2 },
    { checkInDate: "2023-01-10", positive: 9, neutral: 5, negative: 2, critical: 1 },
]

export const OVERVIEW_FILTER = [
    { name: 'Today', value: '1' },
    { name: 'This Week', value: '7' },
    { name: 'This Month', value: '30' },
]

export const LEADERBOARD_FILTER = [
    { name: 'For This Month', value: '30' },
    { name: 'For This Week', value: '7' },
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
    { name: "FREEZE", value: "FREEZE" }
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

export const CHECK_IN_HOURS_DATA = [
    {
        time: '01:00',
        value: 25
    },
    {
        time: '02:00',
        value: 10
    },
    {
        time: '03:00',
        value: 15
    },
    {
        time: '04:00',
        value: 2
    },
    {
        time: '05:00',
        value: 25
    },
    {
        time: '06:00',
        value: 3
    },
    {
        time: '07:00',
        value: 5
    },
    {
        time: '08:00',
        value: 30
    },
    {
        time: '09:00',
        value: 55
    },
    {
        time: '10:00',
        value: 40
    },
    {
        time: '11:00',
        value: 25
    },
    {
        time: '12:00',
        value: 60
    },
    {
        time: '13:00',
        value: 20
    },
    {
        time: '14:00',
        value: 7
    },
    {
        time: '15:00',
        value: 7
    },
    {
        time: '16:00',
        value: 8
    },
    {
        time: '17:00',
        value: 5
    },
    {
        time: '18:00',
        value: 0
    },
    {
        time: '19:00',
        value: 9
    },
    {
        time: '20:00',
        value: 1
    },
    {
        time: '21:00',
        value: 5
    },
    {
        time: '22:00',
        value: 2
    },
    {
        time: '23:00',
        value: 16
    },
    {
        time: '24:00',
        value: 12
    }
]