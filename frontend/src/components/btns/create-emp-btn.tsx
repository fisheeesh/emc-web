import { createEmpSchema } from "@/lib/validators";
import { IoPersonAdd } from "react-icons/io5";
import CreateEditEmpModal from "../modals/create-edit-emp-modal";
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from "react";

export default function CreateEmpBtn() {
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient text-white w-fit min-h-[44px] flex items-center gap-2 cursor-pointer">
                    <IoPersonAdd /> Create a new employee
                </Button>
            </DialogTrigger>
            {createOpen && <CreateEditEmpModal
                formType="CREATE"
                schema={createEmpSchema}
                defaultValues={{
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    phone: "",
                    position: "",
                    department: "",
                    role: "EMPLOYEE",
                    gender: "MALE",
                    birthdate: "",
                    workStyle: "ONSITE",
                    country: "Thailand",
                    jobType: "FULLTIME",
                    avatar: undefined,
                }}
                onClose={() => setCreateOpen(false)}
            />}
        </Dialog>
    )
}
