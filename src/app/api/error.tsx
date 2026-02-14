"use client";

export default function ApiSegmentError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="p-6 text-red-700">
      API segment error: {error.message || "Unknown error"}
    </div>
  );
}
