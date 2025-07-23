interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  ...props
}: DashboardShellProps) {
  return (
    <div className="grid items-start gap-8 p-8" {...props}>
      {children}
    </div>
  );
} 