import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { TfiAnnouncement } from "react-icons/tfi"
import AnnouncementModal from "../modals/announcement-modal"

export default function AnnouncementBtn() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon' className='cursor-pointer'>
                    <TfiAnnouncement />
                </Button>
            </DialogTrigger>

            <AnnouncementModal />
        </Dialog>
    )
}
