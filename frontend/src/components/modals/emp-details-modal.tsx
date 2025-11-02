import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPhoneNumber, generateEmployeeId, getInitialName } from '@/lib/utils';
import { DialogClose } from '@radix-ui/react-dialog';
import { Briefcase, Calendar, Globe, Mail, MapPinned, Phone, User } from 'lucide-react';
import { MdOutlineSick } from "react-icons/md";
import EmpEmotionChart from '../dashboard/charts/emp-emotion-chart';
import AttendanceTimeSection from '../shared/attendance-time-section';
import moment from 'moment';

export default function EmpDetailsModal({ employee }: { employee: Employee }) {
    return (
        <DialogContent className="w-full mx-auto max-h-[90vh] overflow-visible sm:max-w-[1150px] lg:px-8">
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">
                <DialogHeader className="flex flex-col gap-4 md:flex-row items-start justify-between">
                    <div className="flex gap-4 items-center">
                        <Avatar className="size-16">
                            <AvatarImage src={employee.avatar} alt={employee.fullName} />
                            <AvatarFallback>{getInitialName(employee.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className='items-start flex-col'>
                            <DialogTitle className="text-2xl font-semibold">{employee.fullName}</DialogTitle>
                            <p className="text-xs text-muted-foreground font-en">{generateEmployeeId(employee.id)}</p>
                            <p className="text-xs text-muted-foreground font-en">Added on {moment(employee.createdAt).format("LL")}</p>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="personal" className="mt-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger className='cursor-pointer' value="personal">Personal Info</TabsTrigger>
                        <TabsTrigger className='cursor-pointer' value="emotions">Emotion Trends</TabsTrigger>
                        <TabsTrigger className='cursor-pointer' value="attendance">Attendance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 border rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Employee status</p>
                                    <p className="font-semibold text-sm">{employee.jobType}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Job role</p>
                                    <p className="font-semibold text-sm">{employee.position}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Country</p>
                                    <p className="font-semibold text-sm">{employee.country ?? "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <MapPinned className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Workplace</p>
                                    <p className="font-semibold text-sm">{employee.workStyle ?? "Not Specified"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 border-b px-4 py-3">Personal Information</h3>

                            <div className="grid grid-cols-1 gap-4 px-4 pb-3">
                                <div className="flex items-center gap-8 py-2">
                                    <div className='flex items-center gap-4'>
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-muted-foreground w-32">Date of Birth</span>
                                    </div>
                                    <span className="text-sm font-medium font-en">{employee.birthdate ? moment(employee.birthdate).format("LL") : "NULL"}</span>
                                    <span className="text-sm text-muted-foreground ml-4 font-en hidden md:block">Age: {employee.age ?? "NULL"}</span>
                                </div>

                                <div className="flex items-center gap-8 py-2">
                                    <div className='flex items-center gap-4'>
                                        <User className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-muted-foreground w-32">Gender</span>
                                    </div>
                                    <span className="text-sm font-medium">{employee.gender ?? "fe"}</span>
                                </div>

                                <div className="flex items-center gap-8 py-2">
                                    <div className='flex items-center gap-4'>
                                        <MdOutlineSick className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-muted-foreground w-32">Last Critical Time</span>
                                    </div>
                                    <span className="text-sm font-medium font-en">{employee.lastCritical ? moment(employee.lastCritical).format("LL") : "NULL"}</span>
                                </div>

                                <div className="flex items-center gap-8 py-2">
                                    <div className='flex items-center gap-4'>
                                        <MdOutlineSick className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-muted-foreground w-32">Total Critical Times</span>
                                    </div>
                                    <span className="text-sm font-medium font-en">{employee._count.criticalTimes}</span>
                                </div>

                                <div className="flex items-center gap-8 py-2">
                                    <div className='flex items-center gap-4'>
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-muted-foreground w-32">Phone number</span>
                                    </div>
                                    <span className="text-sm font-medium text-brand font-en">{formatPhoneNumber(employee.phone)}</span>
                                </div>

                                <div className="flex items-center gap-8 py-2">
                                    <div className='flex items-center gap-4'>
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-muted-foreground w-32">Email</span>
                                    </div>
                                    <span className="text-sm font-medium text-brand font-en">{employee.email}</span>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="emotions" className="mt-6">
                        <EmpEmotionChart emotionChartData={employee.checkIns} />
                    </TabsContent>

                    <TabsContent value="attendance" className="mt-6">
                        <AttendanceTimeSection data={employee.workSchedule} />
                    </TabsContent>
                </Tabs>

                <DialogFooter className='py-5 border-t mt-5'>
                    <DialogClose asChild>
                        <Button variant='outline' className='cursor-pointer'>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </div>
        </DialogContent>
    );
}