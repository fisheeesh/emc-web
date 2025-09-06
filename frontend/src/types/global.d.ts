interface CommonData {
    label: string
    color: string
}

interface ComparisonData {
    checkInDate: string
    positive: number
    neutral: number
    negative: number
    critical: number
    [key: string]: string | number;
}

interface Employee {
    id: number,
    name: string,
    department: string,
    contact: string,
    score: number
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