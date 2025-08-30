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