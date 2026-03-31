interface BadgeProps {
  variant: 'global' | 'visit' | 'instrument' | 'required';
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  const colorClasses = {
    global: 'bg-[#0366d6]',
    visit: 'bg-[#dbab09]',
    instrument: 'bg-[#2ea44f]',
    required: 'bg-[#d73a49]'
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white align-middle ml-1.5 ${colorClasses[variant]}`}>
      {children}
    </span>
  );
}
