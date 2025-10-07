import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Briefcase, Calendar, Globe, Heart, Mail, MapPin, MapPinned, Phone, User } from 'lucide-react';

export default function EmpDetailsModal() {

    return (
        <DialogContent className="w-full mx-auto max-h-[90vh] overflow-visible sm:max-w-[1024px] lg:px-8">
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">
                <DialogHeader className="flex flex-col gap-4 md:flex-row items-start justify-between">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-300 flex justify-center overflow-hidden">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                                alt="John Smith"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className='items-start flex-col '>
                            <DialogTitle className="text-2xl font-semibold">John Smith</DialogTitle>
                            <p className="text-sm text-left text-gray-500 mt-1"># EMP-3726</p>
                        </div>
                    </div>
                    <div className='flex flex-col-reverse md:flex-row items-start md:items-center justify-center gap-2 md:gap-4'>
                        <p className="text-xs text-gray-400 font-en">Added on 21-Dec-2024</p>
                        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 w-fit">
                            <Mail className="w-4 h-4 mr-2" />
                            Send email
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-4 gap-6 mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Employee status</p>
                            <p className="font-semibold text-sm">Full time</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Job role</p>
                            <p className="font-semibold text-sm">Marketing Manager</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Country</p>
                            <p className="font-semibold text-sm">United States</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <MapPinned className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Workplace</p>
                            <p className="font-semibold text-sm">Onsite</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3 py-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Date of Birth</span>
                            <span className="text-sm font-medium">March 15, 1985</span>
                            <span className="text-sm text-gray-500 ml-4">Age: 39</span>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Gender</span>
                            <span className="text-sm font-medium">Male</span>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <Heart className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Marital status</span>
                            <span className="text-sm font-medium">Married</span>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Phone number</span>
                            <span className="text-sm font-medium text-indigo-600">+1 213-555-7890</span>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Email</span>
                            <span className="text-sm font-medium text-indigo-600">john.smith@company.com</span>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500 w-32">Address</span>
                            <span className="text-sm font-medium">456 Oakwood Avenue, Los Angeles, CA, 90012</span>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
}