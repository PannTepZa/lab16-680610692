import { useEffect, useState } from "react";
import { Check, PlusCircle, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COURSES_STORAGE_KEY = "admin-courses";

const instructorBadgeClass =
  "border-blue-800 bg-blue-950/60 text-blue-200";

type Course = {
  id: string;
  code: string;
  name: string;
  instructors: string[];
};

const initialCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    instructors: [],
  },
  {
    id: "2",
    code: "CS201",
    name: "Data Structures",
    instructors: [],
  },
  {
    id: "3",
    code: "CPE301",
    name: "Basic Computer Engineering Lab",
    instructors: ["Dome", "Chanadda"],
  },
  {
    id: "4",
    code: "CPE302",
    name: "Full Stack Development",
    instructors: ["Dome", "Nirand", "Chanadda"],
  },
  {
    id: "5",
    code: "ISNE101",
    name: "Introduction to Information Systems and Network Engineering",
    instructors: ["KENNETH COSH"],
  },
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(COURSES_STORAGE_KEY);

    if (!saved) return initialCourses;

    try {
      return JSON.parse(saved) as Course[];
    } catch {
      return initialCourses;
    }
  });

  useEffect(() => {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [instructorOpen, setInstructorOpen] = useState(false);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [newInstructor, setNewInstructor] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(
    [],
  );

  const availableInstructors = Array.from(
    new Set(courses.flatMap((course) => course.instructors)),
  );

  const normalizedCode = code.trim().toUpperCase();

  const duplicateCourse = courses.find(
    (course) => course.code.trim().toUpperCase() === normalizedCode,
  );

  const duplicateCode = Boolean(normalizedCode && duplicateCourse);

  const resetForm = () => {
    setCode("");
    setName("");
    setNewInstructor("");
    setSelectedInstructors([]);
    setInstructorOpen(false);
  };

  const toggleInstructor = (instructor: string) => {
    setSelectedInstructors((current) =>
      current.includes(instructor)
        ? current.filter((item) => item !== instructor)
        : [...current, instructor],
    );
  };

  const addNewInstructor = () => {
    const typedName = newInstructor.trim();

    if (!typedName) return;

    const existingName = availableInstructors.find(
      (instructor) =>
        instructor.toLowerCase() === typedName.toLowerCase(),
    );

    const instructorName = existingName ?? typedName;

    setSelectedInstructors((current) =>
      current.includes(instructorName)
        ? current
        : [...current, instructorName],
    );

    setNewInstructor("");
  };

  const removeInstructor = (courseId: string, instructor: string) => {
    setCourses((current) =>
      current.map((course) =>
        course.id === courseId
          ? {
              ...course,
              instructors: course.instructors.filter(
                (item) => item !== instructor,
              ),
            }
          : course,
      ),
    );
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim() || duplicateCode) return;

    setCourses((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        code: code.trim(),
        name: name.trim(),
        instructors: selectedInstructors,
      },
    ]);

    resetForm();
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteCourse) return;

    setCourses((current) =>
      current.filter((course) => course.id !== deleteCourse.id),
    );
    setDeleteCourse(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
            ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          เพิ่มวิชา
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[38%]">รหัสวิชา</TableHead>
              <TableHead className="w-[29%]">ชื่อวิชา</TableHead>
              <TableHead className="w-[27%]">ผู้สอน</TableHead>
              <TableHead className="w-[6%] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  ยังไม่มีวิชาที่เปิดสอน
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="truncate font-medium">
                    {course.code}
                  </TableCell>

                  <TableCell className="truncate">{course.name}</TableCell>

                  <TableCell>
                    {course.instructors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {course.instructors.map((instructor) => (
                          <Badge
                            key={instructor}
                            variant="outline"
                            className={instructorBadgeClass}
                          >
                            {instructor}
                            <button
                              type="button"
                              className="ml-1 rounded-full text-blue-300 hover:text-white"
                              onMouseDown={(event) =>
                                event.preventDefault()
                              }
                              onClick={() =>
                                removeInstructor(course.id, instructor)
                              }
                              aria-label={`ลบผู้สอน ${instructor}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline">ยังไม่มีผู้สอน</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteCourse(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              วิชาที่เพิ่มจะแสดงในรายการทันที
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course-code">รหัสวิชา</Label>
              <Input
                id="course-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="เช่น CPE303"
                aria-invalid={duplicateCode}
                className={duplicateCode ? "border-destructive" : ""}
              />

              {duplicateCode && (
                <p className="text-sm text-destructive">
                  มีรหัสวิชา {duplicateCourse?.code} นี้แล้ว
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course-name">ชื่อวิชา</Label>
              <Input
                id="course-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="เช่น Mobile Application Development"
              />
            </div>

            <div className="grid gap-2">
              <Label>ผู้สอน</Label>

              <Popover
                open={instructorOpen}
                onOpenChange={setInstructorOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 w-full justify-start px-3"
                  >
                    <div className="flex flex-wrap gap-1">
                      {selectedInstructors.length > 0 ? (
                        selectedInstructors.map((instructor) => (
                          <Badge
                            key={instructor}
                            variant="outline"
                            className={instructorBadgeClass}
                          >
                            {instructor}
                            <button
                              type="button"
                              className="ml-1 rounded-full text-blue-300 hover:text-white"
                              onMouseDown={(event) =>
                                event.preventDefault()
                              }
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleInstructor(instructor);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">
                          เลือกผู้สอน
                        </span>
                      )}
                    </div>
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                >
                  <Command>
                    <CommandInput
                      value={newInstructor}
                      onValueChange={setNewInstructor}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addNewInstructor();
                        }
                      }}
                      placeholder="เลือกหรือพิมพ์ชื่อผู้สอน"
                    />

                    <CommandList>
                      {newInstructor.trim() && (
                        <CommandItem
                          value={`เพิ่มผู้สอน ${newInstructor.trim()}`}
                          onSelect={addNewInstructor}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          เพิ่มผู้สอน &quot;{newInstructor.trim()}&quot;
                        </CommandItem>
                      )}

                      {availableInstructors.map((instructor) => {
                        const selected =
                          selectedInstructors.includes(instructor);

                        return (
                          <CommandItem
                            key={instructor}
                            value={instructor}
                            onSelect={() => toggleInstructor(instructor)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selected ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {instructor}
                          </CommandItem>
                        );
                      })}

                      {!newInstructor.trim() &&
                        availableInstructors.length === 0 && (
                          <CommandEmpty>
                            พิมพ์ชื่อเพื่อเพิ่มผู้สอนใหม่
                          </CommandEmpty>
                        )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={!code.trim() || !name.trim() || duplicateCode}
              onClick={handleSave}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteCourse)}
        onOpenChange={(open) => {
          if (!open) setDeleteCourse(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบวิชา</AlertDialogTitle>
            <AlertDialogDescription>
              ต้องการลบวิชา {deleteCourse?.code} ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              ลบวิชา
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}