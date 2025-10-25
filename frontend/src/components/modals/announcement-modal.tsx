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
import { FileIcon, Upload, X } from "lucide-react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { TfiAnnouncement } from "react-icons/tfi"
import Editor from "../editor"
import type z from "zod"
import useMakeAnnouncement from "@/hooks/ui/use-make-announcement"
import Spinner from "../shared/spinner"

export default function AnnouncementModal() {
    const [attachmentPreviews, setAttachmentPreviews] = useState<Array<{ file: File, preview?: string, type: string }>>([])
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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const newPreviews: Array<{ file: File, preview?: string, type: string }> = []

        files.forEach(file => {
            const fileType = file.type.split('/')[0]

            if (fileType === 'image') {
                const reader = new FileReader()
                reader.onloadend = () => {
                    newPreviews.push({
                        file,
                        preview: reader.result as string,
                        type: 'image'
                    })

                    if (newPreviews.length === files.length) {
                        setAttachmentPreviews(prev => [...prev, ...newPreviews])
                    }
                }
                reader.readAsDataURL(file)
            } else {
                newPreviews.push({
                    file,
                    type: 'file'
                })

                if (newPreviews.length === files.length) {
                    setAttachmentPreviews(prev => [...prev, ...newPreviews])
                }
            }
        })

        const currentFiles = form.getValues('images') || []
        form.setValue('images', [...currentFiles, ...files])
    }

    const removeAttachment = (index: number) => {
        setAttachmentPreviews(prev => prev.filter((_, i) => i !== index))
        const currentFiles = form.getValues('images') || []
        const newFiles = currentFiles.filter((_, i) => i !== index)
        form.setValue('images', newFiles)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const onSubmit = (values: z.infer<typeof announcementFormSchema>) => {
        makeAnnouncement({
            subject: values.subject,
            body: values.body,
            attachments: values.images
        }, {
            onSuccess: () => {
                closeButtonRef.current?.click()
            },
            onSettled: () => {
                form.reset()
                setAttachmentPreviews([])
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
                                <FormLabel>Attachments <span className="font-en">(Max 4 files, 10MB each)</span></FormLabel>
                                <FormControl>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                                                multiple
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                id="file-upload"
                                                disabled={attachmentPreviews.length >= 4}
                                            />
                                            <label htmlFor="file-upload">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('file-upload')?.click()}
                                                    disabled={attachmentPreviews.length >= 4}
                                                    className="cursor-pointer"
                                                >
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Files
                                                </Button>
                                            </label>
                                            {attachmentPreviews.length > 0 && (
                                                <span className="text-xs text-muted-foreground font-en">
                                                    {attachmentPreviews.length} / 4 files
                                                </span>
                                            )}
                                        </div>

                                        {attachmentPreviews.length > 0 && (
                                            <div className="space-y-2">
                                                {attachmentPreviews.map((item, index) => (
                                                    <div key={index} className="relative group">
                                                        {item.type === 'image' ? (
                                                            <div className="relative border rounded-md p-2 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                                                <img
                                                                    src={item.preview}
                                                                    alt={item.file.name}
                                                                    className="w-16 h-16 object-cover rounded border"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">
                                                                        {item.file.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground font-en">
                                                                        {formatFileSize(item.file.size)}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeAttachment(index)}
                                                                    className="cursor-pointer bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="relative border rounded-md p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                                                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                                                                    <FileIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium truncate">
                                                                        {item.file.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground font-en">
                                                                        {formatFileSize(item.file.size)}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeAttachment(index)}
                                                                    className="cursor-pointer bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
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