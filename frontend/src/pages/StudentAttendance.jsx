import { Activity } from "lucide-react";

export default function StudentAttendance() {
  return (
    <div className="min-h-screen bg-[#0b0910] text-white p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-purple-300" />

            <h1 className="text-3xl font-semibold">
              My Attendance
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-400">
            View your attendance records and history.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.10] bg-[#111018]/75 p-8">
          <p className="text-gray-400">
            Attendance records will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}