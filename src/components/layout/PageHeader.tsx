interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: string[];
}

export default function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-[#d9d9d9] px-6 py-4">
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="text-xs text-[#6b7280] mb-1">
          {breadcrumb.map((item, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1">›</span>}
              {item}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#32363a]">{title}</h1>
          {subtitle && <p className="text-sm text-[#6b7280] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
