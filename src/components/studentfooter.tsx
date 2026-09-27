type StudentFooterProps = {
  firstName: string;
  lastName: string;
  studentId: string;
};

export function StudentFooter({
  firstName,
  lastName,
  studentId,
}: StudentFooterProps) {
  return (
    <footer className="border-t p-4 text-center text-xs text-muted-foreground">
      จัดทำโดย {firstName} {lastName} — รหัสนักศึกษา {studentId}
    </footer>
  );
}