import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';

interface Props {
    empName: string,
    emoji: string,
    textFeeling: string,
    checkInTime: string,
    score: number
}

export default function EmpEmotionModal({ empName, emoji, textFeeling, checkInTime, score }: Props) {

    return (
        <DialogContent className="max-w-sm mx-auto">
            <DialogHeader className="text-center flex items-center justify-center">
                <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                    {empName}'s
                </DialogTitle>
                <DialogDescription> Today Emotion Check-in</DialogDescription>
            </DialogHeader>

            <div className="text-center space-y-6 py-4">
                <div>
                    <p className="text-sm mb-2">Time</p>
                    <p className="text-3xl font-bold font-en">{checkInTime}</p>
                </div>

                <div className="text-6xl">{emoji}</div>

                <div>
                    <p className=" font-medium font-en">Score: {score}</p>
                </div>

                <div>
                    <p className="text-sm leading-relaxed px-4">
                        {textFeeling}
                    </p>
                </div>
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" className='cursor-pointer'>Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}