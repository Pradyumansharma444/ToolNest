import { Shield, Lock, Eye, Server } from 'lucide-react';
import { useEffect } from 'react';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | ToolNest';
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          At ToolNest, privacy isn't an afterthought — it's our core design principle.
          We believe online tools should work without compromising your data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
          <div className="rounded-xl border bg-card p-5">
            <Lock className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="font-semibold mb-1">No File Uploads</h3>
            <p className="text-sm text-muted-foreground">
              All files are processed entirely in your browser. They never leave your device or touch our servers.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <Eye className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold mb-1">No Tracking</h3>
            <p className="text-sm text-muted-foreground">
              We don't use analytics cookies, fingerprinting, or any tracking technologies. Your usage is anonymous.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <Server className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-semibold mb-1">No Data Collection</h3>
            <p className="text-sm text-muted-foreground">
              We don't collect email addresses, names, or any personal information. No account needed.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <Shield className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-semibold mb-1">Local Storage Only</h3>
            <p className="text-sm text-muted-foreground">
              Your preferences (theme, favorites) are stored locally on your device and never synced to servers.
            </p>
          </div>
        </div>

        <h2>Information Collection</h2>
        <p>
          ToolNest does not collect any personal information. The only data stored is in your browser's localStorage:
        </p>
        <ul>
          <li>Your theme preference (light/dark)</li>
          <li>Your favorited tools list</li>
          <li>Tool usage counters (local only)</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We do not use cookies for tracking or analytics. The only cookies may be those required by our hosting provider for security purposes.
        </p>

        <h2>Advertising</h2>
        <p>
          We display a single, non-intrusive Google AdSense banner on some pages to support our free service.
          Google's ad serving may use cookies. Please refer to Google's privacy policy for more information.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Any changes will be posted on this page.
        </p>

        <h2>Contact</h2>
        <p>
          If you have any questions about this privacy policy, please contact us through our GitHub repository.
        </p>
      </div>
    </div>
  );
}
