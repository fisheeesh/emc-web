import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { TfiAnnouncement } from "react-icons/tfi"
import AnnouncementModal from "../modals/announcement-modal"
import { useState } from "react"

export default function AnnouncementBtn() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon' className='cursor-pointer'>
                    <TfiAnnouncement />
                </Button>
            </DialogTrigger>

            {open && <AnnouncementModal onClose={() => setOpen(false)} />}
        </Dialog>
    )
}
