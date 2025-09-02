import { Badge } from "../ui/badge";

export default function CustomBadge({ score }: { score: number }) {

    const styles = {
        positive: 'text-green-500 bg-green-100',
        neutral: 'text-blue-500 bg-blue-100',
        negative: 'text-yellow-500 bg-yellow-100',
        critical: 'text-red-500 bg-red-100'
    }

    return (
        <Badge className={`rounded-full text-xs font-bold p-0.5 px-1 ${styles[score >= 0.4 ? 'positive' : score >= -0.3 ? 'neutral' : score > -0.8 ? 'negative' : 'critical']}`}>
            {score >= 0.4 ? 'positive' : score >= -0.3 ? 'neutral' : score > -0.8 ? 'negative' : 'critical'}
        </Badge>
    )
}
