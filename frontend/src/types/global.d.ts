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
    gender: string,
    birthdate: string,
    workStyle: string,
    country: string,
    age: number,
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
    },
    analysis: Analysis,
    actionPlan: ActionPlan
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
    avgScore: number,
    actionPlan: ActionPlan,
}

interface Analysis {
    id: number,
    criticalId: number,
    weekRange: number,
    overallMood: string,
    moodTrend: string,
    keyInsights: string[],
    recommendations: string[],
    createdAt: string
}

interface ActionPlan {
    id: string
    department: {
        id: number,
        name: string
    },
    criticalEmployee: {
        employee: {
            fullName: string,
        },
        resovledAt: string
    },
    contact: string,
    priority: string,
    status: string,
    type: string,
    createdAt: string,
    dueDate: string,
    completedAt: string | null,
    assignTo: string,
    actionType: string,
    quickAction: string,
    actionNotes: string,
    followUpNotes: string,
    suggestions: string,
}

type BadgeType =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'approved'
    | 'rejected';

interface Country {
    name: string,
    flag: string,
    iso2: string,
    iso3: string
}