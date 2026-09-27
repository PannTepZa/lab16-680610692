import { Outlet } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { StudentFooter } from "@/components/studentfooter";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Student } from "@/lib/types";

const student: Pick<Student, "firstName" | "lastName" | "studentId"> = {
  firstName: "ปัณณ์",
  lastName: "กิตินา",
  studentId: "680610692",
};

export default function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium">
              จัดการวิชาเรียนและสถานะนักศึกษา
            </span>
          </div>
          <ModeToggle />
        </header>

        <main className="flex-1 p-4">
          <Outlet />
        </main>

        <StudentFooter
          firstName={student.firstName}
          lastName={student.lastName}
          studentId={student.studentId}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}