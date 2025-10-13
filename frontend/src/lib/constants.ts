
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
    { name: 'For This Week', value: '7' },
    { name: 'For This Month', value: '30' },
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
    { name: "High", value: "high" },
    { name: "Medium", value: "medium" },
    { name: "Low", value: "low" }
]

export const RSTATUS = [
    { name: "All Status", value: "all" },
    { name: "Pending", value: "pending" },
    { name: "Approved", value: "approved" },
    { name: "Rejected", value: "rejected" }
]

export const RType = [
    { name: "All Type", value: "all" },
    { name: "Pending", value: "pending" },
    { name: "Processing", value: "processing" },
    { name: "Completed", value: "completed" },
    { name: "Failed", value: "failed" }
]

export const LEADERBOARD = [
    {
        id: 1,
        name: 'Swam Yi Phyo',
        department: "IT",
        points: 1100,
        streak: 11,
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        department: "HR",
        points: 1050,
        streak: 9,
    },
    {
        id: 3,
        name: 'Michael Chen',
        department: "Finance",
        points: 980,
        streak: 8,
    },
    {
        id: 4,
        name: 'Emily Rodriguez',
        department: "Marketing",
        points: 920,
        streak: 10,
    },
    {
        id: 5,
        name: 'David Kim',
        department: "Operations",
        points: 875,
        streak: 0,
    },
    {
        id: 6,
        name: 'Jessica Williams',
        department: "Sales",
        points: 840,
        streak: 0,
    },
    {
        id: 7,
        name: 'James Anderson',
        department: "IT",
        points: 795,
        streak: 0,
    },
]

export const CRITICAL_DATA = [
    {
        id: 22323,
        name: 'Khun Shine Sithu',
        department: "IT",
        contact: "khunshine@ata-it-th.com",
        score: -0.9
    },
    {
        id: 22324,
        department: "HR",
        name: 'May Thida',
        contact: "maythida@ata-it-th.com",
        score: -0.8
    },
    {
        id: 22325,
        department: "Finance",
        name: 'Aung Kyaw',
        contact: "aungkyaw@ata-it-th.com",
        score: -0.8
    },
    {
        id: 22326,
        department: "Marketing",
        name: 'Soe Myat',
        contact: "soemyat@ata-it-th.com",
        score: -0.8
    },
    {
        id: 22327,
        department: "Operations",
        name: 'Hein Htet',
        contact: "heinhtet@ata-it-th.com",
        score: -0.8
    },
    {
        id: 22328,
        department: "IT",
        name: 'Zayyar',
        contact: "zayyar@ata-it-th.com",
        score: -0.8
    },
    {
        id: 22329,
        department: "Sales",
        name: 'Wut Yee',
        contact: "wutyee@ata-it-th.com",
        score: -0.8
    },
    {
        id: 22330,
        department: "Customer Support",
        name: 'Shwe Zin',
        contact: "shwezin@ata-it-th.com",
        score: -0.8
    },
    {
        id: 22331,
        department: "Logistics",
        name: 'Nay Min',
        contact: "naymin@ata-it-th.com",
        score: -0.8
    },
    {
        id: 22332,
        department: "Admin",
        name: 'Thuzar',
        contact: "thuzar@ata-it-th.com",
        score: -0.8
    }
];

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