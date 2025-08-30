export const LOGIN = "Log In"
export const REGISTER = "Register"
export const LOGIN_TITLE = "Hello there!"
export const LOGIN_SUBTITLE = "Login to continue."
export const IMG_URL = import.meta.env.VITE_IMG_URL

export const NAVLINKS = [
    { to: "dashboard/sentiments", name: "Sentiments Dashboard" },
    { to: "dashboard/attendance", name: "Attendance Dashboard" },
    { to: "dashboard/settings", name: "Settings" },
]

export const COMMON_DATAS : CommonData[] = [
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