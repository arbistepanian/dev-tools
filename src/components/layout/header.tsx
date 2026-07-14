interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="border-b border-border pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-copy-default">{title}</h1>
        {description ? (
          <p className="text-sm text-copy-muted">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
