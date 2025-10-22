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
    _count: {
        criticalTimes: number
    },
    department: {
        id: number,
        name: string
    }
    position: string,
    jobType: string,
    checkIns: CheckIn[],
    workSchedule: WorkSchedule
}

interface WorkSchedule {
    attendanceData: {
        timeSlot: string,
        count: number
    }[],
    averageCheckIn: string,
    earliestCheckIn: string
    latestCheckIn: string
    mostCommonTime: string
    totalCheckIns: number
}

interface CheckIn {
    date: string,
    emotion: string
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
    emotionHistory: EmotionHistory[]
}

interface EmotionHistory {
    date: string,
    emotion: string,
    value: number
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
    //* Emotions & Priority
    | 'positive' | 'neutral' | 'negative' | 'critical' | 'high' | 'medium' | 'low'
    //* Roles, Account, Job Types
    | 'EMPLOYEE' | 'ADMIN' | 'SUPERADMIN' | 'ACTIVE' | 'FREEZE'
    | 'FULLTIME' | 'PARTTIME' | 'CONTRACT' | 'INTERNSHIP'
    //* Action Status
    | 'pending' | 'processing' | 'completed' | 'approved' | 'failed' | 'rejected';

interface Country {
    name: string,
    flag: string,
    independent: boolean
}

interface SummaryData {
    wellbeing: {
        score: string;
        maxScore: number;
        change: number;
        trend: 'up' | 'down';
    };
    criticalAlerts: {
        count: number;
        change: number;
        resolvedThisMonth: number;
        trend: 'up' | 'down';
    };
    checkInRate: {
        rate: number;
        change: number;
        trend: 'up' | 'down';
    };
    positiveRate: {
        rate: number;
        change: number;
        trend: 'up' | 'down';
    };
}

interface ActionPlanStatus {
    status: string,
    count: number
    fill: string
}

interface DepHeatMap {
    name: string,
    avgScore: number,
    status: string,
    employees: number,
    trend: string
}

interface AvgResponseTime {
    department: string,
    responseTime: number
}