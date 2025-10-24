/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import useGenerateAIAnalysis from "@/hooks/ai/use-generate-ai-analysis";
import { DialogClose } from "@radix-ui/react-dialog";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { IoSparklesOutline } from "react-icons/io5";
import { RiRefreshLine } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "../ui/button";
import useRegenerateAIAnalysis from "@/hooks/ai/use-regenerate-ai-analysis";
import queryClient from "@/api/query";

interface Props {
    analysis?: Analysis;
    empName: string;
    criticalEmpId: number;
    canRegenerate?: boolean
}

export default function AIAnalysisModal({ analysis: initialAnalysis, empName, criticalEmpId, canRegenerate }: Props) {
    const [analysis, setAnalysis] = useState<Analysis | undefined>(initialAnalysis);
    const [progress, setProgress] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const { generateAnalysis } = useGenerateAIAnalysis();
    const { regenerateAnalysis, regenerating } = useRegenerateAIAnalysis();

    const handleGenerateAnalysis = async () => {
        setIsGenerating(true);
        setProgress(0);
        let isApiComplete = false;

        //* Start progress simulation
        const interval = setInterval(() => {
            setProgress((prev) => {
                //* If API is done, jump to 100%
                if (isApiComplete) {
                    clearInterval(interval);
                    return 100;
                }

                //* Otherwise keep incrementing but never reach 100%
                if (prev >= 95) {
                    //* Stay at 95% until API completes
                    return 95;
                }
                //* Increase by 15% each second
                return prev + 15;
            });
        }, 1000);

        try {
            const response = await generateAnalysis({ criticalEmpId });

            //* Mark API as complete - this will trigger progress to jump to 100%
            isApiComplete = true;

            //* Wait for progress bar to reach 100%, then show analysis
            setTimeout(() => {
                clearInterval(interval);
                setAnalysis(response.data);
                queryClient.invalidateQueries({ queryKey: ["critical", "infinite"], exact: false })
                setProgress(0);
                setIsGenerating(false);
                toast.success('Success', {
                    description: "AI-Analysis generated successfully.",
                });
            }, 1200)
        } catch (error) {
            clearInterval(interval);
            setProgress(0);
            setIsGenerating(false);
        }
    };

    const handleRegenerateAnalysis = async () => {
        setIsRegenerating(true);
        setProgress(0);
        let isApiComplete = false;

        //* Start progress simulation
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (isApiComplete) {
                    clearInterval(interval);
                    return 100;
                }

                if (prev >= 95) {
                    return 95;
                }
                return prev + 15;
            });
        }, 1000);

        try {
            const response = await regenerateAnalysis({ criticalEmpId });

            //* Mark API as complete
            isApiComplete = true;

            //* Wait for progress bar to reach 100%, then show updated analysis
            setTimeout(() => {
                clearInterval(interval);
                setAnalysis(response.data);
                queryClient.invalidateQueries({ queryKey: ["critical", "infinite"], exact: false })
                setProgress(0);
                setIsRegenerating(false);
                toast.success('Success', {
                    description: "AI-Analysis regenerated successfully.",
                });
            }, 1200);
        } catch (error) {
            clearInterval(interval);
            setProgress(0);
            setIsRegenerating(false);
        }
    }

    const showProgressBar = isGenerating || isRegenerating;

    return (
        <DialogContent className="w-full mx-auto max-h-[95vh] overflow-y-auto sm:max-w-[1024px] no-scrollbar">
            {!analysis && !showProgressBar ? (
                <div className="min-h-[500px] flex flex-col items-center justify-center p-8">
                    <div className="relative mb-8">
                        {/* Animated rings */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 opacity-20 blur-2xl animate-pulse"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                        {/* Main button with shimmer effect */}
                        <div className="relative">
                            <Button
                                onClick={handleGenerateAnalysis}
                                className="relative cursor-pointer h-32 w-32 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden group"
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>

                                <IoSparklesOutline className="text-5xl text-white relative z-10" />
                            </Button>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-3">
                        Unlock AI-Powered Insights
                    </h3>
                    <p className="text-center text-muted-foreground max-w-md mb-6">
                        Generate a comprehensive emotional analysis for <br /><span className="font-semibold text-foreground">{empName}</span> using advanced AI.
                        Get actionable insights and personalized recommendations.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <span>Weekly Mood Trends</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                            <span>Key Insights</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span>Recommendations</span>
                        </div>
                    </div>
                </div>
            ) : showProgressBar ? (
                <div className="min-h-[500px] flex flex-col items-center justify-center p-8">
                    <div className="relative mb-8">
                        {/* Spinning gradient ring */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 opacity-30 blur-xl animate-spin-slow"></div>

                        <div className="relative h-32 w-32 rounded-full bg-background flex items-center justify-center border-4 border-muted">
                            <Loader2 className="h-16 w-16 text-pink-500 animate-spin" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-3 flex items-center gap-2">
                        <IoSparklesOutline className="text-pink-500 animate-pulse" />
                        {isRegenerating ? 'Regenerating AI Analysis' : 'Generating AI Analysis'}
                    </h3>

                    <p className="text-center text-muted-foreground max-w-md mb-6">
                        {isRegenerating ? 'Creating fresh' : 'Creating'} comprehensive emotional analysis for <br />
                        <span className="font-semibold text-foreground">{empName}</span>
                    </p>

                    {/* Progress bar */}
                    <div className="w-full max-w-md mb-4">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500 ease-out relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-2 font-mono">{progress}%</p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 max-w-md">
                        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                            Please don't refresh or close this modal. This will take <span className="font-en">10-15</span> seconds.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <DialogHeader className="flex flex-col md:flex-row items-start justify-between space-y-0 pb-4 border-b">
                        <div className="space-y-1.5">
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <IoSparklesOutline className="text-xl text-pink-400" />
                                AI-Powered Weekly Emotional Analysis
                            </DialogTitle>
                            <DialogDescription className="line-clamp-1 text-start">
                                Summary of {empName}'s emotional state across the week
                            </DialogDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="cursor-pointer shrink-0 mr-5"
                            onClick={() => toast.success("SYP TODO", { description: "Will implement this later on." })}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </DialogHeader>

                    <div id="analysis" className="space-y-6 mt-4 font-en">
                        {/* Week Range */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Analysis Period</p>
                            <p className="text-lg font-semibold font-en">{analysis?.weekRange}</p>
                        </div>

                        {/* Overall Mood */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                Overall Mood
                            </h3>
                            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                                <p className="text-base leading-relaxed">{analysis?.overallMood}</p>
                            </div>
                        </div>

                        {/* Mood Trend */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                                Mood Trend
                            </h3>
                            <div className="bg-pink-500/5 rounded-lg p-4 border border-pink-500/20">
                                <p className="text-base leading-relaxed">{analysis?.moodTrend}</p>
                            </div>
                        </div>

                        {/* Key Insights */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                Key Insights
                            </h3>
                            <div className="space-y-2">
                                {analysis?.keyInsights.map((insight, index) => (
                                    <div key={index} className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20 flex gap-3">
                                        <span className="text-blue-500 font-bold font-en">{index + 1}.</span>
                                        <p className="text-sm flex-1 leading-relaxed">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <IoSparklesOutline className="text-amber-500" />
                                Recommendations
                            </h3>
                            <div className="space-y-2">
                                {analysis?.recommendations.map((rec, index) => (
                                    <div key={index} className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-lg p-3 border border-amber-500/20 flex gap-3">
                                        <span className="text-amber-500">✦</span>
                                        <p className="text-sm flex-1 leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {
                        analysis && !showProgressBar &&
                        <div className="mt-5 pt-5 border-t flex justify-end">
                            {
                                canRegenerate ?
                                    <Button
                                        type="button"
                                        disabled={regenerating}
                                        onClick={handleRegenerateAnalysis}
                                        className="flex text-white items-center gap-2 cursor-pointer bg-gradient">
                                        <RiRefreshLine />
                                        Re-Generate
                                    </Button>
                                    : <DialogClose asChild>
                                        <Button variant='outline' className="cursor-pointer">
                                            Close
                                        </Button>
                                    </DialogClose>
                            }
                        </div>
                    }
                </>
            )}
        </DialogContent>
    );
}