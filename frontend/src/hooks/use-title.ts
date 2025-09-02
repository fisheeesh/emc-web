import { useEffect } from "react"

const useTitle = (title: string) => {
    useEffect(() => {
        document.title = `${title} | ATA`

        return () => { document.title = "ATA - Emotion Check-in System"; }
    }, [title])
}

export default useTitle