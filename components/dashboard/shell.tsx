export function DashboardShell({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="grid items-start gap-8 p-8" {...props}>
      {children}
    </div>
  );
} 