import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BsFiletypeCsv } from 'react-icons/bs'
import CSVUploadModal from '../modals/csv-upload-modal'
import { useState } from 'react';

export default function UploadCSVBtn() {
    const [csvOpen, setCsvOpen] = useState(false);

    return (
        <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' className="min-h-[44px] cursor-pointer w-fit">
                    <BsFiletypeCsv /> Upload CSV
                </Button>
            </DialogTrigger>
            {csvOpen && <CSVUploadModal />}
        </Dialog>
    )
}
