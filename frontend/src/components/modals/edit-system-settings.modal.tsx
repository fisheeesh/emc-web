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
import { IoWarning } from "react-icons/io5";

interface EditSystemSettingsModalProps {
    data: SystemSettings;
    onClose?: () => void;
}

export default function EditSystemSettingsModal({ data, onClose }: EditSystemSettingsModalProps) {
    const { updateSystemSettings, updating } = useUpdateSystemSettings()

    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            watchlistTrackMin: data.watchlistTrackMin.toString(),
        },
    });

    const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
        updateSystemSettings({
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto no-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <Settings className="size-5 md:size-7" />
                    System Settings
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-start">
                    Configure system parameters. Emotion thresholds are locked to maintain data integrity. <br />
                    <span className="text-amber-600 mt-2 dark:text-amber-400 font-medium flex items-center gap-1">
                        <IoWarning className="mb-[1px]" />
                        Changing thresholds would invalidate all historical analytics data.
                    </span>
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-3">
                        <FormLabel className="text-green-600 dark:text-green-400 font-semibold">
                            Positive Threshold (Locked)
                        </FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FormLabel className="text-xs text-muted-foreground">Minimum</FormLabel>
                                <Input
                                    type="number"
                                    value={data.positiveMin.toString()}
                                    disabled
                                    className="min-h-[44px] font-en bg-muted cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <FormLabel className="text-xs text-muted-foreground">Maximum</FormLabel>
                                <Input
                                    type="number"
                                    value={data.positiveMax.toString()}
                                    disabled
                                    className="min-h-[44px] font-en bg-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <FormDescription className="text-xs">
                            Score range for classifying emotions as positive
                        </FormDescription>
                    </div>

                    <div className="space-y-3">
                        <FormLabel className="text-purple-600 dark:text-purple-400 font-semibold">
                            Neutral Threshold (Locked)
                        </FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FormLabel className="text-xs text-muted-foreground">Minimum</FormLabel>
                                <Input
                                    type="number"
                                    value={data.neutralMin.toString()}
                                    disabled
                                    className="min-h-[44px] font-en bg-muted cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <FormLabel className="text-xs text-muted-foreground">Maximum</FormLabel>
                                <Input
                                    type="number"
                                    value={data.neutralMax.toString()}
                                    disabled
                                    className="min-h-[44px] font-en bg-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <FormDescription className="text-xs">
                            Score range for classifying emotions as neutral
                        </FormDescription>
                    </div>

                    <div className="space-y-3">
                        <FormLabel className="text-orange-600 dark:text-orange-400 font-semibold">
                            Negative Threshold (Locked)
                        </FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FormLabel className="text-xs text-muted-foreground">Minimum</FormLabel>
                                <Input
                                    type="number"
                                    value={data.negativeMin.toString()}
                                    disabled
                                    className="min-h-[44px] font-en bg-muted cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <FormLabel className="text-xs text-muted-foreground">Maximum</FormLabel>
                                <Input
                                    type="number"
                                    value={data.negativeMax.toString()}
                                    disabled
                                    className="min-h-[44px] font-en bg-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <FormDescription className="text-xs">
                            Score range for classifying emotions as negative
                        </FormDescription>
                    </div>

                    <div className="space-y-3">
                        <FormLabel className="text-red-600 dark:text-red-400 font-semibold">
                            Critical Threshold (Locked)
                        </FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <FormLabel className="text-xs text-muted-foreground">Minimum</FormLabel>
                                <Input
                                    type="number"
                                    value={data.criticalMin.toString()}
                                    disabled
                                    className="min-h-[44px] font-en bg-muted cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <FormLabel className="text-xs text-muted-foreground">Maximum</FormLabel>
                                <Input
                                    type="number"
                                    value={data.criticalMax.toString()}
                                    disabled
                                    className="min-h-[44px] font-en bg-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <FormDescription className="text-xs">
                            Score range triggering critical alerts
                        </FormDescription>
                    </div>

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
                                    Number of days to track employees on watchlist <span className="font-en">(14 to 365)</span>
                                </FormDescription>
                                <FormMessage className="font-en" />
                            </FormItem>
                        )}
                    />

                    <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
                        <DialogClose>
                            <Button
                                type="button"
                                variant="outline"
                                className="min-h-[44px] cursor-pointer w-full"
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