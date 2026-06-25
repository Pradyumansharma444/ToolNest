import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

export function IconRenderer({ name, className }: IconRendererProps) {
  // Lucide icons are exported as PascalCase (e.g., FileText, Scissors)
  // Ensure we check for PascalCase matching first
  let resolvedName = name;
  if (name && name.length > 0) {
    resolvedName = name.charAt(0).toUpperCase() + name.slice(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[resolvedName];

  if (!IconComponent) {
    // Return standard HelpCircle as fallback
    const FallbackIcon = Icons.HelpCircle || Icons.Wrench;
    return <FallbackIcon className={className} />;
  }

  return <IconComponent className={className} />;
}
