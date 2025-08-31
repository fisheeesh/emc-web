import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { IoSparklesOutline } from "react-icons/io5";
import { Button } from "../ui/button";

export default function DetailsModal({ employee }: { employee: Employee }) {
    return (
        <DialogContent className="w-full mx-auto max-h-[80vh] overflow-y-auto sm:max-w-[1024px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                    <IoSparklesOutline className="text-xl text-pink-400" />
                    AI-Powered Weekly Emotional Analysis
                </DialogTitle>
                <DialogDescription>
                    Summary of {employee.name}'s emotional state across the week
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-2 border-b pb-5">
                <div className="space-y-2">
                    <p className="font-semibold text-sm">Day 1</p>
                    <p className="text-sm text-muted-foreground">
                        Tired and stressed, workload overwhelming. That's a red flag. Maybe they're taking on too much or not managing their time well.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="font-semibold text-sm">Day 2</p>
                    <p className="text-sm text-muted-foreground">
                        Trouble sleeping and anxious. Lack of sleep can really affect mental health, making everything feel worse. Maybe the anxiety is about work or personal stuff, but it's spilling over.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="font-semibold text-sm">Day 3</p>
                    <p className="text-sm text-muted-foreground">
                        Unmotivated, avoiding colleagues, skipped lunch. Skipping meals isn't good for energy or mood. Avoiding others could mean they're feeling isolated or just can't handle social interactions right now.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="font-semibold text-sm">Day 4</p>
                    <p className="text-sm text-muted-foreground">
                        Headache, thinking about quitting. Physical symptoms like headaches can be a sign of stress. Thinking about quitting is serious; it shows they're feeling stuck or hopeless.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="font-semibold text-sm">Day 5</p>
                    <p className="text-sm text-muted-foreground">
                        Pretending to be fine but feeling heavy and hopeless. This is concerning. They might feel they can't open up about their true feelings, which can make things worse.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="font-semibold text-sm">Day 6</p>
                    <p className="text-sm text-muted-foreground">
                        Couldn't focus, made mistakes, felt guilty. Lack of focus can lead to mistakes, which then cause more stress and guilt. It's a vicious cycle.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="font-semibold text-sm">Day 7</p>
                    <p className="text-sm text-muted-foreground">
                        Exhausted, questioning the point of everything. This sounds like they might be experiencing a deeper issue, maybe even depression or burnout.
                    </p>
                </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-4">
                <DialogClose asChild>
                    <Button className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 text-white font-semibold hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition-colors duration-300">
                        <IoSparklesOutline className="text-xl" />
                        Generate AI-Suggestion
                    </Button>
                </DialogClose>
            </div>
        </DialogContent>
    )
}