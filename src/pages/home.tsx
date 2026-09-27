import { Outlet } from "react-router";

export default function HomePage() {
  return (
    <main className="flex-1 p-4">
      <div className="mx-auto max-w-2xl space-y-2 py-8">
        <h1 className="text-2xl font-semibold">
          ระบบจัดการวิชาเรียนและสถานะนักศึกษา
        </h1>
      </div>
      <Outlet />
    </main>
  );
}