export function PageLoading({ label }: { label: string }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="py-16 text-center text-sm text-muted"
    >
      {label}
    </p>
  );
}
