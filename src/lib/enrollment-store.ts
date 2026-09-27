import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { courses as initialCourses, students as initialStudents } from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  addCourseToStudent: (studentId: string, courseId: string) => void;
  /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  removeCourseFromStudent: (studentId: string, courseId: string) => void;
  /** ลบนักศึกษา */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ courseId ออกจาก enrolledCourses ของนักศึกษาทุกคน */
  removeCourse: (courseId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourseToStudent: (studentId, courseId) =>
        set((state) => ({
          students: state.students.map((student) => {
            if (student.studentId !== studentId) return student;
            if (student.enrolledCourses.includes(courseId)) return student;

            return {
              ...student,
              enrolledCourses: [...student.enrolledCourses, courseId],
            };
          }),
        })),

      removeCourseFromStudent: (studentId, courseId) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.studentId !== studentId
              ? student
              : {
                  ...student,
                  enrolledCourses: student.enrolledCourses.filter(
                    (value) => value !== courseId,
                  ),
                },
          ),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter(
            (student) => student.studentId !== studentId,
          ),
        })),

      removeCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter((course) => course.courseCode !== courseId),
          students: state.students.map((student) => ({
            ...student,
            enrolledCourses: student.enrolledCourses.filter(
              (value) => value !== courseId,
            ),
          })),
        })),
    }),
    {
      name: "lab16-2569-students",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);