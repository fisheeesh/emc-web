interface CommonData {
    label: string
    color: string
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
    fullName: string,
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    accType: string,
    role: string,
    avatar: string,
    createdAt: string,
    lastCritical: string,
    status: string,
    department: {
        id: number,
        name: string
    }
    position: string,
    jobType: string,
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

interface LeaderboardData {
    rank: number,
    email: string,
    streak: number,
    points: number,
    avatar: string,
    department: {
        id: number,
        name: string
    },
    fullName: string
}

interface CriticalEmployee {
    id: number,
    emotionScore: number,
    isResolved: boolean,
    resolvedAt: string,
    department: {
        id: number,
        name: string
    },
    employee: {
        id: number,
        fullName: string,
        avatar: string,
        email: string,
        lastCritical: string
    }
    createdAt: string,
}

interface WatchlistEmployee {
    id: number,
    fullName: string,
    avatar: string,
    email: string,
    department: {
        id: number,
        name: string
    },
}

interface ActionPlan {
    id: string
    department: {
        id: number,
        name: string
    },
    priority: string,
    status: string,
    type: string,
    createdAt: string,
    dueDate: string,
    assignTo: string,
    actionType: string,
    quickAction: string,
    actionNotes: string,
    followUpNotes: string,
    suggestions: string,
}