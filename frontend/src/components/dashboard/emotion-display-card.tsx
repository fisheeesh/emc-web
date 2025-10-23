import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem
} from "@/components/ui/carousel";
import { cn, getEmotionColors } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MdEdit } from "react-icons/md";
import { RiEmotionHappyLine } from "react-icons/ri";
import { useState } from "react";
import ModifyEmotionsModal from "@/components/modals/modify-emotions-modal";

export default function EmotionDisplay({ data }: { data: EmotionCategory[] }) {
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
                                    data={data}
                                    onClose={() => setModifyOpen(false)}
                                />
                            )}
                        </Dialog>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {!data || data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
                        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
                            <RiEmotionHappyLine className="size-12 text-gray-400 dark:text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Emotion Categories Yet</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                            Click the edit button above to add emotions.
                        </p>
                    </div>
                ) : (
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {data.map((category, index) => (
                                <CarouselItem key={index}>
                                    <Card className="border-2">
                                        <CardHeader>
                                            <CardTitle className={cn(
                                                "text-xl md:text-2xl bg-gradient-to-r bg-clip-text text-transparent font-bold",
                                                getEmotionColors(category.title.toLowerCase())
                                            )}>
                                                {category.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {!category.emotions || category.emotions.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                                    <p className="text-sm text-muted-foreground">
                                                        No emotions in this category yet
                                                    </p>
                                                </div>
                                            ) : (
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
                                            )}
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                )}
            </CardContent>
        </Card>
    );
}