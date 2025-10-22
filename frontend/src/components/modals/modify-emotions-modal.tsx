import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdAdd } from "react-icons/md";
import { RiEmotionHappyLine } from "react-icons/ri";
import { z } from "zod";

interface Emotion {
    icon: string;
    label: string;
}

const INITIAL_EMOTIONS: Record<string, Emotion[]> = {
    negative: [
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
    neutral: [
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
    positive: [
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
};

const addEmotionSchema = z.object({
    emoji: z.string().min(1, "Emoji is required"),
    label: z.string().min(1, "Label is required"),
});

interface ModifyEmotionsModalProps {
    onClose?: () => void;
}

export default function ModifyEmotionsModal({ onClose }: ModifyEmotionsModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<'negative' | 'neutral' | 'positive'>('neutral');
    const [emotions, setEmotions] = useState<Record<string, Emotion[]>>(INITIAL_EMOTIONS);

    const form = useForm({
        resolver: zodResolver(addEmotionSchema),
        defaultValues: {
            emoji: '',
            label: '',
        },
    });

    const handleAddEmotion = (values: z.infer<typeof addEmotionSchema>) => {
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
        setEmotions(prev => ({
            ...prev,
            [selectedCategory]: prev[selectedCategory].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = () => {
        console.log('Submitting emotions:', emotions);
        onClose?.();
    };

    return (
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto no-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <RiEmotionHappyLine className="size-5 md:size-7" />
                    Modify Emtion Categories
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-start">
                    Customize emotion tags for each category. Add or remove emotions as needed.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
                {/* Category Select */}
                <div className="space-y-2">
                    <Label>Select Category</Label>
                    <Select
                        value={selectedCategory}
                        onValueChange={(value: 'negative' | 'neutral' | 'positive') => setSelectedCategory(value)}
                    >
                        <SelectTrigger className="min-h-[44px] cursor-pointer">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="negative">Negative</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Emotion Tags */}
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
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Add New Emotion */}
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
                                                    maxLength={1}
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
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="min-h-[44px] w-[44px] bg-gradient text-white cursor-pointer"
                                >
                                    <MdAdd className="w-5 h-5" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter an emoji and an adjective that describes the emotion
                            </p>
                        </form>
                    </Form>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="min-h-[44px]"
                >
                    Close
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="min-h-[44px] bg-gradient text-white cursor-pointer"
                >
                    Save Changes
                </Button>
            </div>
        </DialogContent>
    );
}