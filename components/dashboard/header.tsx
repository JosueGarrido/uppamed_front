interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div className="grid gap-1 flex-1 min-w-0">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl truncate">{heading}</h1>
        {text && <p className="text-sm sm:text-base md:text-lg text-muted-foreground">{text}</p>}
      </div>
      {children && (
        <div className="w-full sm:w-auto flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
} 