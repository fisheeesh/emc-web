import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IMG_URL } from '@/lib/constants';
import { formatPhoneNumber, generateEmployeeId, getInitialName } from '@/lib/utils';
import { DialogClose } from '@radix-ui/react-dialog';
import { Briefcase, Calendar, Globe, Mail, MapPinned, Phone, User } from 'lucide-react';
import { MdOutlineSick } from "react-icons/md";
import EmpEmotionChart from '../dashboard/charts/emp-emotion-chart';
import AttendanceTimeSection from '../shared/attendance-time-section';

export default function EmpDetailsModal({ employee }: { employee: Employee }) {
    return (
        <DialogContent className="w-full mx-auto max-h-[90vh] overflow-visible sm:max-w-[1150px] lg:px-8">
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">
                <DialogHeader className="flex flex-col gap-4 md:flex-row items-start justify-between">
                    <div className="flex gap-4">
                        <Avatar className="size-16">
                            <AvatarImage src={IMG_URL + employee.avatar} alt={employee.fullName} />
                            <AvatarFallback>{getInitialName(employee.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className='items-start flex-col'>
                            <DialogTitle className="text-2xl font-semibold">{employee.fullName}</DialogTitle>
                            <p className="text-sm text-left text-gray-500 mt-1 font-en">{generateEmployeeId(employee.id)}</p>
                        </div>
                    </div>
                    <div className='flex flex-col-reverse md:flex-row items-start md:items-center justify-center gap-2 md:gap-4'>
                        <p className="text-xs text-gray-400 font-en">Added on {employee.createdAt}</p>
                        <a href={`mailto:${employee.email}`} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-brand dark:text-white hover:bg-blue-600 cursor-pointer w-fit">
                                <Mail className="w-4 h-4 mr-2" />
                                Send email
                            </Button>
                        </a>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Employee status</p>
                            <p className="font-semibold text-sm">{employee.jobType}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Job role</p>
                            <p className="font-semibold text-sm">{employee.position}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Country</p>
                            <p className="font-semibold text-sm">{employee.country ?? "N/A"}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <MapPinned className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Workplace</p>
                            <p className="font-semibold text-sm">{employee.workStyle ?? "Not Specified"}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 border-b px-4 py-3">Personal Information</h3>

                    <div className="grid grid-cols-1 gap-4 px-4 pb-3">
                        <div className="flex items-center gap-8 py-2">
                            <div className='flex items-center gap-4'>
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Date of Birth</span>
                            </div>
                            <span className="text-sm font-medium font-en">{employee.birthdate ?? "NULL"}</span>
                            <span className="text-sm text-gray-500 ml-4 font-en hidden md:block">Age: {employee.age ?? "NULL"}</span>
                        </div>

                        <div className="flex items-center gap-8 py-2">
                            <div className='flex items-center gap-4'>
                                <User className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Gender</span>
                            </div>
                            <span className="text-sm font-medium">{employee.gender ?? "fe"}</span>
                        </div>

                        <div className="flex items-center gap-8 py-2">
                            <div className='flex items-center gap-4'>
                                <MdOutlineSick className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Last Critical Time</span>
                            </div>
                            <span className="text-sm font-medium font-en">{employee.lastCritical ?? "NULL"}</span>
                        </div>

                        <div className="flex items-center gap-8 py-2">
                            <div className='flex items-center gap-4'>
                                <MdOutlineSick className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Total Critical Times</span>
                            </div>
                            <span className="text-sm font-medium font-en">{employee._count.criticalTimes}</span>
                        </div>

                        <div className="flex items-center gap-8 py-2">
                            <div className='flex items-center gap-4'>
                                <Phone className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Phone number</span>
                            </div>
                            <span className="text-sm font-medium text-brand font-en">{formatPhoneNumber(employee.phone)}</span>
                        </div>

                        <div className="flex items-center gap-8 py-2">
                            <div className='flex items-center gap-4'>
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500 w-32">Email</span>
                            </div>
                            <span className="text-sm font-medium text-brand">{employee.email}</span>
                        </div>
                    </div>
                </div>

                <EmpEmotionChart emotionChartData={employee.checkIns} />

                <AttendanceTimeSection data={employee.workSchedule} />

                <DialogFooter className='py-5 border-t mt-5'>
                    <DialogClose>
                        <Button variant='outline' className='cursor-pointer'>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </div>
        </DialogContent>
    );
}