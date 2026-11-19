export function OfflineNotice({
  message = "Backend server is currently offline or unreachable. Displaying cached records.",
}) {
  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300"
    >
      <span className="font-semibold">Service Notice:</span> {message}
    </div>
  );
}

export default OfflineNotice;
