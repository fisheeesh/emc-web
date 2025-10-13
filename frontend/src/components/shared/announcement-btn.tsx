import { Button } from "@/components/ui/button"
import { TfiAnnouncement } from "react-icons/tfi"

export default function AnnouncementBtn() {
    return (
        <Button variant='outline' size='icon' className='cursor-pointer'>
            <TfiAnnouncement />
        </Button>
    )
}
