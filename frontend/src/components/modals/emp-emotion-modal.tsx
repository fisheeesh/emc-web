import { DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '../ui/button';

const empName = "John Smith";
const empScore = 7;
const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
});
const emotion = "😊";
const feelingText = "I have many ongoing projects and I couldn't sleep at night.";

export default function EmpEmotionModal() {

    return (
        <DialogContent className="max-w-sm mx-auto">
            <DialogHeader className="text-center flex items-center justify-center">
                <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                    {empName}'s
                </DialogTitle>
                <DialogDescription> Today Emotion Check-in</DialogDescription>
            </DialogHeader>

            <div className="text-center space-y-6 py-4">
                {/* Time Section */}
                <div>
                    <p className="text-sm mb-2">Time</p>
                    <p className="text-3xl font-bold font-en">{currentTime}</p>
                </div>

                {/* Emotion */}
                <div className="text-6xl">{emotion}</div>

                {/* Score */}
                <div>
                    <p className=" font-medium font-en">Score: {empScore}</p>
                </div>

                {/* Feeling Text */}
                <div>
                    <p className="text-sm leading-relaxed px-4">
                        {feelingText}
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