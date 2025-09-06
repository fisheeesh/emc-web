interface CommonData {
    label: string
    color: string
}

interface AdminUser {
    id: number,
    fullName: string,
    email: string,
    avatar: string,
    role: string
}

interface Filter {
    name: string
    value: string
}

interface ComparisonData {
    checkInDate: string
    positive: number
    neutral: number
    negative: number
    critical: number
    [key: string]: string | number;
}

interface AttendanceData {
    checkInDate: string,
    value: number
}

interface CheckInHoursData {
    checkInHour: string,
    value: number
}

interface Employee {
    id: number,
    position: string,
    jobType: string,
    fullName: string
}

interface AttendanceOverviewData {
    id: number,
    emoji: string,
    textFeeling: string,
    emotionScore: number,
    checkInTime: string,
    status: "positive" | "neutral" | "negative" | "critical",
    employee: Employee
}