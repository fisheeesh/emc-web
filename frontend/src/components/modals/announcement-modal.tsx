import { Button } from "@/components/ui/button"
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { announcementFormSchema } from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import '@mdxeditor/editor/style.css'
import { Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { TfiAnnouncement } from "react-icons/tfi"
import Editor from "../editor"
import type z from "zod"
import useMakeAnnouncement from "@/hooks/ui/use-make-announcement"
import Spinner from "../shared/spinner"

export default function AnnouncementModal() {
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const { makeAnnouncement, making } = useMakeAnnouncement()
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    const form = useForm<z.infer<typeof announcementFormSchema>>({
        resolver: zodResolver(announcementFormSchema),
        defaultValues: {
            subject: "",
            body: "",
            images: [],
        },
    })

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const newPreviews: string[] = []

        files.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                newPreviews.push(reader.result as string)
                if (newPreviews.length === files.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews])
                }
            }
            reader.readAsDataURL(file)
        })

        setImageFiles(prev => [...prev, ...files])
        form.setValue('images', [...imageFiles, ...files])
    }

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
        const newFiles = imageFiles.filter((_, i) => i !== index)
        setImageFiles(newFiles)
        form.setValue('images', newFiles)
    }

    const onSubmit = (values: z.infer<typeof announcementFormSchema>) => {
        makeAnnouncement({
            subject: values.subject,
            body: values.body
        }, {
            onSuccess: () => {
                closeButtonRef.current?.click()
            },
            onSettled: () => {
                form.reset()
                setImagePreviews([])
                setImageFiles([])
            }
        })
    }

    return (
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto no-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <TfiAnnouncement className="text-blue-600 size-5 md:size-7" />
                    Send Announcement
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                    Create and send an announcement email to all employees
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject <span className="font-en text-red-600">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        className="min-h-[48px]"
                                        placeholder="Enter email subject"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message Body <span className="font-en text-red-600">*</span></FormLabel>
                                <FormControl>
                                    <div className="border rounded-md">
                                        <Editor
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="images"
                        render={() => (
                            <FormItem>
                                <FormLabel>Attachments (Images)</FormLabel>
                                <FormControl>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label htmlFor="image-upload">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('image-upload')?.click()}
                                                >
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Images
                                                </Button>
                                            </label>
                                        </div>

                                        {imagePreviews.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-md border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-2 right-2 cursor-pointer bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                ref={closeButtonRef}
                                type="button"
                                className="min-h-[48px] cursor-pointer"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="min-h-[48px] cursor-pointer bg-brand text-white hover:bg-blue-600">
                            <Spinner isLoading={making} label="Sending...">
                                Send Announcement
                            </Spinner>
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent >
    )
}