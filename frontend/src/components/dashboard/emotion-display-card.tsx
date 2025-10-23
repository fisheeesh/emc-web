import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MdEdit } from "react-icons/md";
import { useState } from "react";
import ModifyEmotionsModal from "@/components/modals/modify-emotions-modal";

interface Emotion {
    icon: string;
    label: string;
}

interface EmotionCategory {
    title: string;
    emotions: Emotion[];
    color: string;
}

const EMOTION_DATA: EmotionCategory[] = [
    {
        title: 'Negative',
        emotions: [
            { icon: '😓', label: 'tired' },
            { icon: '😩', label: 'stressed' },
            { icon: '😴', label: 'bored' },
            { icon: '😡', label: 'frustrated' },
            { icon: '😞', label: 'disappointed' },
            { icon: '😭', label: 'sad' },
            { icon: '😰', label: 'anxious' },
            { icon: '😒', label: 'annoyed' },
            { icon: '😠', label: 'mad' },
        ],
        color: 'from-red-500 to-orange-500',
    },
    {
        title: 'Neutral',
        emotions: [
            { icon: '😐', label: 'neutral' },
            { icon: '😌', label: 'calm' },
            { icon: '😑', label: 'meh' },
            { icon: '😶', label: 'indifferent' },
            { icon: '🙂', label: 'okay' },
            { icon: '😕', label: 'unsure' },
            { icon: '🤔', label: 'curious' },
            { icon: '🙃', label: 'playful' },
            { icon: '🫤', label: 'uncertain' },
        ],
        color: 'from-purple-500 to-indigo-500',
    },
    {
        title: 'Positive',
        emotions: [
            { icon: '😀', label: 'happy' },
            { icon: '😄', label: 'excited' },
            { icon: '😍', label: 'loved' },
            { icon: '😁', label: 'joyful' },
            { icon: '🥳', label: 'celebratory' },
            { icon: '😎', label: 'confident' },
            { icon: '😊', label: 'grateful' },
            { icon: '🤩', label: 'thrilled' },
            { icon: '😇', label: 'peaceful' },
        ],
        color: 'from-green-500 to-emerald-500',
    },
];

export default function EmotionDisplay() {
    const [modifyOpen, setModifyOpen] = useState(false);

    return (
        <Card className="rounded-md max-h-[600px] flex flex-col gap-5">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl text-gradient line-clamp-1">
                            Emotion Categories
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                            View all emotion categories and their feelings
                        </CardDescription>
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                        <Dialog open={modifyOpen} onOpenChange={setModifyOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size='sm'
                                    className="bg-gradient text-white cursor-pointer w-fit"
                                >
                                    <MdEdit />
                                </Button>
                            </DialogTrigger>
                            {modifyOpen && (
                                <ModifyEmotionsModal
                                    onClose={() => setModifyOpen(false)}
                                />
                            )}
                        </Dialog>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {EMOTION_DATA.map((category, index) => (
                            <CarouselItem key={index}>
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className={cn(
                                            "text-xl md:text-2xl bg-gradient-to-r bg-clip-text text-transparent font-bold",
                                            category.color
                                        )}>
                                            {category.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                                            {category.emotions.map((emotion, emotionIndex) => (
                                                <div
                                                    key={emotionIndex}
                                                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                                >
                                                    <span className="text-3xl md:text-4xl mb-2">
                                                        {emotion.icon}
                                                    </span>
                                                    <span className="text-xs md:text-sm font-medium capitalize text-center">
                                                        {emotion.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </CardContent>
        </Card>
    );
}