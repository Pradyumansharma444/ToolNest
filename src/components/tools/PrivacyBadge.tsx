import { Shield } from 'lucide-react';

export function PrivacyBadge() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
      <Shield className="w-4 h-4 flex-shrink-0" />
      <span>
        <strong>All processing happens in your browser.</strong> Files never leave your device.
      </span>
    </div>
  );
}
