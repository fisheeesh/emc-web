import { type ChangeEvent, type DragEvent, useState } from "react";
import { HiOutlineCloudUpload } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { MdOutlineFileUpload } from "react-icons/md";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useBulkRegister from "@/hooks/emps/use-bulk-register";
import Spinner from "../shared/spinner";

type UploadStatus = "success" | "failed";

interface UploadResult {
    status: UploadStatus;
    email: string;
    error?: string;
}

export default function CSVUploadModal() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { bulkRegister, bulking } = useBulkRegister();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File): void => {
        setError(null);

        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('File size must be less than 5MB');
            return;
        }

        const validMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/plain'];
        if (file.type && !validMimeTypes.includes(file.type)) {
            setError('Invalid file type. Please upload a CSV file');
            return;
        }

        setSelectedFile(file);
        setUploadResults(null);
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (): Promise<void> => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        try {
            setError(null);
            const formData = new FormData();
            formData.append('csvFile', selectedFile);

            const response = await bulkRegister(formData);

            if (response?.results) {
                setUploadResults(response.results);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
            setError(errorMessage);
        }
    };

    const handleClose = (): void => {
        setSelectedFile(null);
        setUploadResults(null);
        setError(null);
    };

    const successCount = uploadResults?.filter(r => r.status === 'success').length || 0;
    const failureCount = uploadResults?.filter(r => r.status === 'failed').length || 0;

    return (
        <DialogContent className="w-full mx-auto max-h-[95vh] overflow-y-auto sm:max-w-[850px] no-scrollbar">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl text-blue-700">
                    <MdOutlineFileUpload className="text-2xl" />
                    <span>Bulk Upload Users</span>
                </DialogTitle>
                <DialogDescription>
                    Upload a CSV file to register multiple users at once
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!uploadResults ? (
                    <>
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-slate-800 rounded-md">
                            <h3 className="font-semibold mb-2 text-sm dark:text-white">CSV File Requirements:</h3>
                            <ul className="text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
                                <li>File must be in CSV format (.csv)</li>
                                <li>Maximum file size: <span className="font-en">5</span>MB</li>
                                <li>First row must be headers: <code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">firstName,lastName,email,password,position,department</code></li>
                                <li>All columns are required in exact order</li>
                                <li>Password must be at least <span className="font-en">8</span> numbers</li>
                            </ul>
                        </div>

                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-slate-800'
                                : 'border-gray-300 dark:border-slate-600'
                                }`}
                        >
                            <HiOutlineCloudUpload className="mx-auto text-6xl text-gray-400 mb-4" />

                            {selectedFile ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Selected file:
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">
                                            {selectedFile.name}
                                        </span>
                                        <Button
                                            onClick={() => setSelectedFile(null)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            type="button"
                                        >
                                            <IoMdClose />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 font-en">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                        Drag and drop your CSV file here, or
                                    </p>
                                    <Label htmlFor="csv-upload" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                                        Browse Files
                                        <Input
                                            id="csv-upload"
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            disabled={bulking}
                                        />
                                    </Label>
                                </>
                            )}
                        </div>

                        <DialogFooter className="flex justify-end gap-3 mt-6">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={bulking}
                                    variant="outline"
                                    className="min-h-[44px] cursor-pointer"
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                onClick={handleUpload}
                                disabled={!selectedFile || bulking}
                                className="bg-brand text-white hover:bg-blue-600! min-h-[44px] cursor-pointer"
                            >
                                <Spinner isLoading={bulking} label="Uploading...">
                                    Upload & Register
                                </Spinner>
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-en">{successCount}</p>
                                </div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-en">{failureCount}</p>
                                </div>
                            </div>

                            {failureCount > 0 && (
                                <div className="max-h-60 overflow-auto border dark:border-slate-700 rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Error</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {uploadResults
                                                .filter(r => r.status === 'failed')
                                                .map((result, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{result.email}</TableCell>
                                                        <TableCell className="text-red-600 dark:text-red-400">
                                                            {result.error}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="flex justify-end mt-6">
                            <DialogClose asChild>
                                <Button
                                    variant='outline'
                                    type="button"
                                    onClick={handleClose}
                                    className="cursor-pointer"
                                >
                                    Done
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </>
                )}
            </div>
        </DialogContent>
    );
}