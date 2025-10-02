import { LiaSpinnerSolid } from "react-icons/lia";

interface SpinnerProps {
    isLoading: boolean,
    label: string,
    children: React.ReactNode
}

export default function Spinner({ isLoading, label, children }: SpinnerProps) {
    return (
        <>
            {
                isLoading ? <>
                    <LiaSpinnerSolid className='size-4 animate-spin' />
                    <span>{label}</span>
                </> : children
            }
        </>
    )
}
