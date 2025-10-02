import { Skeleton } from '../ui/skeleton'
import { TableBody, TableCell, TableRow } from '../ui/table'

interface TableSkeletonProps {
    cols: number
}

export default function TableSkeleton({ cols }: TableSkeletonProps) {
    return (
        <TableBody>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
                <TableRow key={`skel-row-${rowIndex}`}>
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <TableCell key={`skel-cell-${rowIndex}-${colIndex}`} className='py-4'>
                            <Skeleton className="h-4 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    )
}