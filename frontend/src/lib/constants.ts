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

export const COMMON_DATAS = [
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