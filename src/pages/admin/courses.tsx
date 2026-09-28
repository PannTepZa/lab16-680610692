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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200";

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
    instructors: ["Kenneth Cosh"],
  },
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(COURSES_STORAGE_KEY);

    if (!saved) return initialCourses;

    try {
      const parsed = JSON.parse(saved) as Course[];
      return Array.isArray(parsed) ? parsed : initialCourses;
    } catch {
      return initialCourses;
    }
  });

  useEffect(() => {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [instructorOpen, setInstructorOpen] = useState(false);
  const [activeInstructorIndex, setActiveInstructorIndex] = useState(0);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [newInstructor, setNewInstructor] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(
    [],
  );

  const availableInstructors = Array.from(
    new Set([
      ...courses.flatMap((course) => course.instructors),
      ...selectedInstructors,
    ]),
  );
  const instructorQuery = newInstructor.trim();
  const matchingInstructors = availableInstructors.filter((instructor) =>
    instructor.toLowerCase().includes(instructorQuery.toLowerCase()),
  );
  const canAddInstructor =
    Boolean(instructorQuery) &&
    !availableInstructors.some(
      (instructor) =>
        instructor.toLowerCase() === instructorQuery.toLowerCase(),
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
    setActiveInstructorIndex(0);
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
    setActiveInstructorIndex(0);
    setInstructorOpen(true);
  };

  const instructorOptions = [
    ...(canAddInstructor
      ? [{ type: "new" as const, name: instructorQuery }]
      : []),
    ...matchingInstructors.map((name) => ({
      type: "existing" as const,
      name,
    })),
  ];

  const selectInstructorOption = (index: number) => {
    const option = instructorOptions[index];
    if (!option) return;

    if (option.type === "new") {
      addNewInstructor();
      return;
    }

    toggleInstructor(option.name);
    setNewInstructor("");
    setActiveInstructorIndex(0);
    setInstructorOpen(true);
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
                    {course.code.toUpperCase()}
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
                              className="ml-1 rounded-full text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-white"
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาเรียน</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course-code">รหัสวิชา</Label>
              <Input
                id="course-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="เช่น CS101"
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
                placeholder="เช่น Introduction to Programming"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course-instructors">ผู้สอน</Label>
              <div className="relative">
                <div className="flex min-h-11 w-full flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-2.5 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
                  {selectedInstructors.map((instructor) => (
                    <Badge
                      key={instructor}
                      variant="outline"
                      className={instructorBadgeClass}
                    >
                      {instructor}
                      <button
                        type="button"
                        className="ml-1 rounded-full text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-white"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => toggleInstructor(instructor)}
                        aria-label={`ลบผู้สอน ${instructor}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    id="course-instructors"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={instructorOpen}
                    aria-controls="course-instructor-options"
                    aria-activedescendant={
                      instructorOpen && instructorOptions.length > 0
                        ? `course-instructor-option-${activeInstructorIndex}`
                        : undefined
                    }
                    autoComplete="off"
                    className="h-8 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    value={newInstructor}
                    onChange={(event) => {
                      setNewInstructor(event.target.value);
                      setActiveInstructorIndex(0);
                      setInstructorOpen(true);
                    }}
                    onFocus={() => setInstructorOpen(true)}
                    onBlur={() => setInstructorOpen(false)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown" && instructorOptions.length) {
                        event.preventDefault();
                        setInstructorOpen(true);
                        setActiveInstructorIndex((current) =>
                          Math.min(current + 1, instructorOptions.length - 1),
                        );
                      } else if (
                        event.key === "ArrowUp" &&
                        instructorOptions.length
                      ) {
                        event.preventDefault();
                        setActiveInstructorIndex((current) =>
                          Math.max(current - 1, 0),
                        );
                      } else if (
                        event.key === "Enter" &&
                        instructorOpen &&
                        instructorOptions.length
                      ) {
                        event.preventDefault();
                        selectInstructorOption(activeInstructorIndex);
                      } else if (event.key === "Escape") {
                        setInstructorOpen(false);
                      } else if (
                        event.key === "Backspace" &&
                        !newInstructor &&
                        selectedInstructors.length > 0
                      ) {
                        toggleInstructor(
                          selectedInstructors[selectedInstructors.length - 1],
                        );
                      }
                    }}
                    placeholder={
                      selectedInstructors.length === 0
                        ? "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                        : "เพิ่มผู้สอน"
                    }
                  />
                </div>

                {instructorOpen && (
                  <div
                    id="course-instructor-options"
                    role="listbox"
                    className="absolute inset-x-0 top-full z-[60] mt-1 max-h-56 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
                  >
                    {instructorOptions.length > 0 ? (
                      instructorOptions.map((option, index) => {
                        const selected =
                          option.type === "existing" &&
                          selectedInstructors.includes(option.name);

                        return (
                          <div
                            id={`course-instructor-option-${index}`}
                            key={`${option.type}-${option.name}`}
                            role="option"
                            aria-selected={selected}
                            className={`flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                              index === activeInstructorIndex
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }`}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() =>
                              setActiveInstructorIndex(index)
                            }
                            onClick={() => selectInstructorOption(index)}
                          >
                            {option.type === "new" ? (
                              <>
                                <PlusCircle className="h-4 w-4" />
                                เพิ่มผู้สอน &quot;{option.name}&quot;
                              </>
                            ) : (
                              <>
                                <span className="flex h-4 w-4 items-center justify-center">
                                  {selected && <Check className="h-4 w-4" />}
                                </span>
                                {option.name}
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-2 py-2 text-center text-sm text-muted-foreground">
                        พิมพ์ชื่อเพื่อเพิ่มผู้สอนใหม่
                      </div>
                    )}
                  </div>
                )}
              </div>
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