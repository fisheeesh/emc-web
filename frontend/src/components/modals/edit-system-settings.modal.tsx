
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useUpdateSystemSettings from "@/hooks/ui/use-update-system-settings";
import { settingsSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Spinner from "../shared/spinner";

interface EditSystemSettingsModalProps {
    data: SystemSettings;
    onClose?: () => void;
}

export default function EditSystemSettingsModal({ data, onClose }: EditSystemSettingsModalProps) {
    const { updateSystemSettings, updating } = useUpdateSystemSettings()

    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            positiveMin: data.positiveMin.toString(),
            neutralMin: data.neutralMin.toString(),
            negativeMin: data.negativeMin.toString(),
            criticalMin: data.criticalMin.toString(),
            watchlistTrackMin: data.watchlistTrackMin.toString(),
        },
    });

    const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
        updateSystemSettings({
            positiveMin: +values.positiveMin,
            negativeMin: +values.negativeMin,
            neutralMin: +values.neutralMin,
            criticalMin: +values.criticalMin,
            watchlistTrackMin: +values.watchlistTrackMin
        }, {
            onSettled: () => {
                form.reset()
                onClose?.()
            }
        })
    };

    const isWorking = form.formState.isSubmitting || updating

    return (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto no-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <Settings className="size-5 md:size-7" />
                    Edit System Settings
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-start">
                    Configure emotion scoring thresholds and tracking parameters. <br />
                    Values must follow: Critical &lt; Negative &lt; Neutral &lt; Positive
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <FormField
                        control={form.control}
                        name="positiveMin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-green-600 dark:text-green-400 font-semibold">
                                    Positive Threshold
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="0.5"
                                        {...field}
                                        className="min-h-[44px] font-en"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Minimum score for classifying emotions as positive <span className="font-en">(-99.9 to 99.9)</span>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="neutralMin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-purple-600 dark:text-purple-400 font-semibold">
                                    Neutral Threshold
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="0.0"
                                        {...field}
                                        className="min-h-[44px] font-en"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Minimum score for classifying emotions as neutral <span className="font-en">(-99.9 to 99.9)</span>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="negativeMin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-orange-600 dark:text-orange-400 font-semibold">
                                    Negative Threshold
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="-0.5"
                                        {...field}
                                        className="min-h-[44px] font-en"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Minimum score for classifying emotions as negative <span className="font-en">(-99.9 to 99.9)</span>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="criticalMin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-red-600 dark:text-red-400 font-semibold">
                                    Critical Threshold
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="-1.0"
                                        {...field}
                                        className="min-h-[44px] font-en"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Minimum score triggering critical alerts <span className="font-en">(-99.9 to 99.9)</span>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="watchlistTrackMin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-blue-600 dark:text-blue-400 font-semibold">
                                    Watchlist Duration
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="14"
                                        {...field}
                                        className="min-h-[44px] font-en"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Number of days to track employees on watchlist <span className="font-en">(1 to 365)</span>
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
                        <DialogClose>
                            <Button
                                type="button"
                                variant="outline"
                                className="min-h-[44px] cursor-pointer"
                                disabled={isWorking}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            className="min-h-[44px] bg-gradient text-white cursor-pointer"
                            disabled={isWorking}
                        >
                            <Spinner isLoading={isWorking} label="Saving...">
                                Save Changes
                            </Spinner>
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}