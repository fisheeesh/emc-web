
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useUpdateEmotionCategories from "@/hooks/ui/use-update-emotion-categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import { RiEmotionHappyLine } from "react-icons/ri";
import { toast } from "sonner";
import { z } from "zod";
import Spinner from "../shared/spinner";

const addEmotionSchema = z.object({
    emoji: z.string().min(1, "Emoji is required"),
    label: z.string().min(1, "Label is required").max(50, "Label must be 50 characters or less"),
});

interface ModifyEmotionsModalProps {
    onClose?: () => void;
    data: EmotionCategory[];
}

export default function ModifyEmotionsModal({ onClose, data }: ModifyEmotionsModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<'Negative' | 'Neutral' | 'Positive'>('Neutral');
    const [emotions, setEmotions] = useState<Record<string, Emotion[]>>({
        Negative: [],
        Neutral: [],
        Positive: [],
    });

    const { updateEmotionCate, updating } = useUpdateEmotionCategories()

    const form = useForm({
        resolver: zodResolver(addEmotionSchema),
        defaultValues: {
            emoji: '',
            label: '',
        },
    });

    useEffect(() => {
        if (data && data.length > 0) {
            const emotionsMap: Record<string, Emotion[]> = {
                Negative: [],
                Neutral: [],
                Positive: [],
            };

            data.forEach((category) => {
                emotionsMap[category.title] = category.emotions || [];
            });

            setEmotions(emotionsMap);
        }
    }, [data]);

    const handleAddEmotion = (values: z.infer<typeof addEmotionSchema>) => {
        //* Check if already at 9 emotions
        if (emotions[selectedCategory].length >= 9) {
            toast.error('Maximum 9 emotions allowed per category');
            return;
        }

        //* Check for duplicate label
        const isDuplicate = emotions[selectedCategory].some(
            e => e.label.toLowerCase() === values.label.trim().toLowerCase()
        );

        if (isDuplicate) {
            toast.error('This emotion already exists in this category');
            return;
        }

        setEmotions(prev => ({
            ...prev,
            [selectedCategory]: [
                ...prev[selectedCategory],
                { icon: values.emoji.trim(), label: values.label.trim().toLowerCase() }
            ]
        }));

        form.reset();
    };

    const handleDeleteEmotion = (index: number) => {
        const deletedEmotion = emotions[selectedCategory][index];

        setEmotions(prev => ({
            ...prev,
            [selectedCategory]: prev[selectedCategory].filter((_, i) => i !== index)
        }));

        toast.success(`Removed "${deletedEmotion.label}" from ${selectedCategory}`);
    };

    const handleSubmit = () => {
        if (emotions[selectedCategory].length !== 9) {
            toast.error(`You must have exactly 9 emotions in the ${selectedCategory} category. Currently: ${emotions[selectedCategory].length}`);
            return;
        }

        updateEmotionCate({
            title: selectedCategory,
            emotions: emotions[selectedCategory],
        }, {
            onSettled: () => {
                form.reset()
                onClose?.()
            }
        });
    };

    const currentEmotionCount = emotions[selectedCategory].length;
    const isMaxReached = currentEmotionCount >= 9;
    const canSubmit = currentEmotionCount === 9;

    return (
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto no-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <RiEmotionHappyLine className="size-5 md:size-7" />
                    Modify Emotion Categories
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-start">
                    Customize emotion tags for each category. Each category must have exactly 9 emotions.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
                <div className="space-y-2">
                    <Label>Select Category</Label>
                    <Select
                        value={selectedCategory}
                        onValueChange={(value: 'Negative' | 'Neutral' | 'Positive') => setSelectedCategory(value)}
                    >
                        <SelectTrigger className="min-h-[44px] cursor-pointer">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Negative">
                                <div className="flex items-center justify-between w-full gap-2">
                                    <span>Negative</span>
                                    <span className={`text-xs font-en font-bold ${emotions.Negative.length === 9
                                        ? 'text-green-600'
                                        : 'text-orange-600'
                                        }`}>
                                        ({emotions.Negative.length}/9)
                                    </span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Neutral">
                                <div className="flex items-center justify-between w-full gap-2">
                                    <span>Neutral</span>
                                    <span className={`text-xs font-en font-bold ${emotions.Neutral.length === 9
                                        ? 'text-green-600'
                                        : 'text-orange-600'
                                        }`}>
                                        ({emotions.Neutral.length}/9)
                                    </span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Positive">
                                <div className="flex items-center justify-between w-full gap-2">
                                    <span>Positive</span>
                                    <span className={`text-xs font-en font-bold ${emotions.Positive.length === 9
                                        ? 'text-green-600'
                                        : 'text-orange-600'
                                        }`}>
                                        ({emotions.Positive.length}/9)
                                    </span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Current Emotions</Label>
                    <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                        {emotions[selectedCategory].length === 0 ? (
                            <p className="text-sm text-muted-foreground w-full text-center py-[11px]">
                                No emotions added yet. Add your first emotion below.
                            </p>
                        ) : (
                            emotions[selectedCategory].map((emotion, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full whitespace-nowrap"
                                >
                                    <span className="text-lg">{emotion.icon}</span>
                                    <span className="text-sm font-medium capitalize">{emotion.label}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteEmotion(index)}
                                        className="ml-1 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                                        aria-label={`Remove ${emotion.label}`}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Add New Emotion</Label>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddEmotion)} className="space-y-2">
                            <div className="flex items-start gap-2">
                                <FormField
                                    control={form.control}
                                    name="emoji"
                                    render={({ field }) => (
                                        <FormItem className="w-20">
                                            <FormControl>
                                                <Input
                                                    placeholder="😊"
                                                    {...field}
                                                    className="min-h-[44px] text-center text-2xl"
                                                    maxLength={2}
                                                    disabled={isMaxReached}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="label"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    placeholder="Add only adjective to express emotion (e.g., happy, sad, excited)"
                                                    {...field}
                                                    className="min-h-[44px]"
                                                    disabled={isMaxReached}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="min-h-[44px] w-[44px] bg-gradient text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isMaxReached}
                                >
                                    <MdAdd className="w-5 h-5" />
                                </Button>
                            </div>
                            {
                                isMaxReached ?
                                    <p className="text-xs text-muted-foreground">
                                        Maximum 9 emotions reached. You can now save changes.
                                    </p>
                                    : <p className="text-xs text-muted-foreground">
                                        Enter an emoji and an adjective that describes the emotion (<span className="font-en">{9 - currentEmotionCount}</span> more needed)
                                    </p>
                            }
                        </form>
                    </Form>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="min-h-[44px] cursor-pointer"
                    disabled={updating}
                >
                    Close
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="min-h-[44px] bg-gradient text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canSubmit || updating}
                >
                    <Spinner isLoading={updating} label="Saving...">
                        Save Changes
                    </Spinner>
                </Button>
            </div>
        </DialogContent>
    );
}