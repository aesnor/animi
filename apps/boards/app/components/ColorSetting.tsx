interface ColorSettingProps {
  value: string;
  onChange: (val: string) => void;
  title?: string;
  label?: string;
  className?: string;
}

export function ColorSetting({ value, onChange, title, label, className = "" }: ColorSettingProps) {
  const hasLabel = Boolean(label && label.trim() !== "");

  return (
    <label
      className={`flex cursor-pointer items-center rounded bg-secondary px-3 py-1 transition select-none hover:bg-secondary-hover ${
        hasLabel ? "justify-between" : "justify-center"
      } ${className}`}
      title={title}
    >
      {hasLabel && <span className="text-xs text-text-muted md:text-sm">{label}</span>}

      <div
        className="relative h-5 w-14 overflow-hidden rounded-md border border-white/20 shadow-inner"
        style={{ background: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </label>
  );
}
