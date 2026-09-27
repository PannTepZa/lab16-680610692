import { useEffect, useState } from "react";
import { Check, PlusCircle, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

const COURSES_STORAGE_KEY = "admin-courses";

const studentBadgeClass =
  "border-blue-800 bg-blue-950/60 text-blue-200";

type AdminCourse = {
  id: string;
  code: string;
  name: string;
  instructors: string[];
};

export default function AdminEnrollmentsPage() {
  const {
    students,
    addCourseToStudent,
    removeCourseFromStudent,
  } = useEnrollmentStore();

  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
  const [formCourse, setFormCourse] = useState("");
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<"course" | "student">(
    "course",
  );
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("all");

  const loadCourses = () => {
    const savedCourses = localStorage.getItem(COURSES_STORAGE_KEY);

    if (!savedCourses) {
      setAdminCourses([]);
      return;
    }

    try {
      const parsedCourses = JSON.parse(savedCourses) as AdminCourse[];
      setAdminCourses(Array.isArray(parsedCourses) ? parsedCourses : []);
    } catch {
      setAdminCourses([]);
    }
  };

  useEffect(() => {
    loadCourses();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === COURSES_STORAGE_KEY) loadCourses();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const availableStudents = students.filter(
    (student) =>
      Boolean(formCourse) &&
      !student.enrolledCourses.includes(formCourse),
  );

  const getCourseStudents = (courseCode: string) =>
    students.filter((student) =>
      student.enrolledCourses.includes(courseCode),
    );

  const getStudentName = (studentId: string) => {
    const student = students.find(
      (item) => item.studentId === studentId,
    );

    return student
      ? `${student.firstName} ${student.lastName}`
      : studentId;
  };

  const visibleCourses = adminCourses.filter((course) => {
    if (searchType === "course") {
      return (
        selectedCourse === "all" ||
        course.code === selectedCourse
      );
    }

    if (selectedStudent === "all") return true;

    const student = students.find(
      (item) => item.studentId === selectedStudent,
    );

    return student?.enrolledCourses.includes(course.code);
  });

  const toggleStudent = (studentId: string) => {
    setFormStudents((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  const handleCourseChange = (courseCode: string) => {
    setFormCourse(courseCode);
    setFormStudents([]);
    setStudentPopoverOpen(false);
  };

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;

    formStudents.forEach((studentId) => {
      addCourseToStudent(studentId, formCourse);
    });

    setFormCourse("");
    setFormStudents([]);
    setStudentPopoverOpen(false);
    setDialogOpen(false);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);

    if (!open) {
      setFormCourse("");
      setFormStudents([]);
      setStudentPopoverOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>

        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>

        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="mt-3">
              <PlusCircle className="mr-2 h-4 w-4" />
              ลงทะเบียนให้นักศึกษา
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
              <DialogDescription>
                เลือกวิชาก่อน แล้วเลือกนักศึกษาได้หลายคน
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>วิชา</Label>

                <Select
                  value={formCourse}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกวิชา" />
                  </SelectTrigger>

                  <SelectContent>
                    {adminCourses.length === 0 ? (
                      <SelectItem value="ไม่มีวิชา" disabled>
                        ยังไม่มีวิชาในตารางจัดการวิชาเรียน
                      </SelectItem>
                    ) : (
                      adminCourses.map((course) => (
                        <SelectItem key={course.id} value={course.code}>
                          {course.code} — {course.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>นักศึกษา</Label>

                <Popover
                  open={studentPopoverOpen}
                  onOpenChange={setStudentPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!formCourse}
                      className="min-h-11 w-full justify-start px-3"
                    >
                      {formStudents.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formStudents.map((studentId) => (
                            <Badge
                              key={studentId}
                              variant="outline"
                              className={studentBadgeClass}
                            >
                              {getStudentName(studentId)}

                              <button
                                type="button"
                                className="ml-1 rounded-full text-blue-300 hover:text-white"
                                onMouseDown={(event) =>
                                  event.preventDefault()
                                }
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleStudent(studentId);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          {formCourse
                            ? "เลือกนักศึกษา (ได้หลายคน)"
                            : "กรุณาเลือกวิชาก่อน"}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                  >
                    <Command>
                      <CommandInput placeholder="ค้นหานักศึกษา..." />

                      <CommandList>
                        <CommandEmpty>
                          ไม่พบนักศึกษาที่ยังไม่ได้ลงทะเบียน
                        </CommandEmpty>

                        {availableStudents.map((student) => {
                          const selected = formStudents.includes(
                            student.studentId,
                          );

                          return (
                            <CommandItem
                              key={student.studentId}
                              value={`${student.studentId} ${student.firstName} ${student.lastName}`}
                              onSelect={() =>
                                toggleStudent(student.studentId)
                              }
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selected
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {student.studentId} —{" "}
                              {student.firstName} {student.lastName}
                            </CommandItem>
                          );
                        })}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={!formCourse || formStudents.length === 0}
                onClick={handleEnroll}
              >
                ลงทะเบียน ({formStudents.length} คน)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={searchType}
        onValueChange={(value) =>
          setSearchType(value as "course" | "student")
        }
        className="w-fit"
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
      </Tabs>

      {searchType === "course" ? (
        <Select
          value={selectedCourse}
          onValueChange={setSelectedCourse}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="ทุกวิชา" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">ทุกวิชา</SelectItem>

            {adminCourses.map((course) => (
              <SelectItem key={course.id} value={course.code}>
                {course.code} — {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Select
          value={selectedStudent}
          onValueChange={setSelectedStudent}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="ทุกคน" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">ทุกคน</SelectItem>

            {students.map((student) => (
              <SelectItem
                key={student.studentId}
                value={student.studentId}
              >
                {student.studentId} — {getStudentName(student.studentId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead className="w-[140px]">
                จำนวน นศ.
              </TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleCourses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            ) : (
              visibleCourses.map((course) => {
                const enrolledStudents = getCourseStudents(course.code);

                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {course.code}
                    </TableCell>

                    <TableCell>{course.name}</TableCell>

                    <TableCell>{enrolledStudents.length}</TableCell>

                    <TableCell>
                      {enrolledStudents.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {enrolledStudents.map((student) => (
                            <Badge
                              key={student.studentId}
                              variant="outline"
                              className={studentBadgeClass}
                            >
                              {getStudentName(student.studentId)}

                              <button
                                type="button"
                                className="ml-1 rounded-full text-blue-300 hover:text-white"
                                aria-label={`ลบ ${getStudentName(
                                  student.studentId,
                                )}`}
                                onMouseDown={(event) =>
                                  event.preventDefault()
                                }
                                onClick={() =>
                                  removeCourseFromStudent(
                                    student.studentId,
                                    course.code,
                                  )
                                }
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          ยังไม่มีนักศึกษาลงทะเบียน
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}