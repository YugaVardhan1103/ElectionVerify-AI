import React from "react";

interface OfflineNoticeProps {
  message?: string;
}

export function OfflineNotice({
  message = "Backend server is currently offline or unreachable. Demonstrating using local client session state. No persistent data or real verification engine is active.",
}: OfflineNoticeProps) {
  return (
    <div
      role="status"
      className="mb-6 rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
    >
      <span className="font-semibold">Demonstration Mode Notice:</span> {message}
    </div>
  );
}

export default OfflineNotice;
