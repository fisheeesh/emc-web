import { Badge } from "../ui/badge";

type StatusType = 'positive' | 'neutral' | 'negative' | 'critical' | "high" | "medium" | "low";

export default function CustomBadge({ status }: { status: StatusType }) {

    const styles: Record<StatusType, string> = {
        positive: 'text-green-500 bg-green-100',
        neutral: 'text-blue-500 bg-blue-100',
        negative: 'text-yellow-500 bg-yellow-100',
        critical: 'text-red-500 bg-red-100',
        high: 'text-red-500 bg-red-100',
        medium: 'text-yellow-500 bg-yellow-100',
        low: 'text-blue-500 bg-blue-100',
    }

    return (
        <Badge className={`rounded-full text-xs font-bold p-0.5 px-2 ${styles[status]}`}>
            {status}
        </Badge>
    )
}
