import { DialogContent, DialogTitle, DialogDescription, DialogClose, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import Spinner from "../shared/spinner";
import { Button } from "../ui/button";

interface Props {
    title: string,
    description: string,
    isLoading: boolean,
    loadingLabel: string,
    onConfirm: () => void
}

export default function ConfirmModal({ title, description, isLoading, loadingLabel, onConfirm }: Props) {
    return (
        <DialogContent className="sm:max-w-[500px] bg-card">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                    {description}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" className="cursor-pointer">Cancel</Button>
                </DialogClose>
                <Button onClick={onConfirm} type="submit" variant='destructive' className="cursor-pointer">
                    <Spinner isLoading={isLoading} label={loadingLabel} >
                        Confirm
                    </Spinner>
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}
