export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl animate-pulse space-y-8">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-96 rounded bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>

        <div className="h-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </main>
  );
}
