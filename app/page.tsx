import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Team Task Manager</h1>
      <p className="mb-4">
        REST APIs and database setup are ready for authentication, projects, team
        members, tasks, and dashboard reporting.
      </p>
      <Link href="/dashboard" className="underline">
        Open dashboard
      </Link>
    </main>
  );
}
