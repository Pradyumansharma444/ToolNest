import { FileText } from 'lucide-react';
import { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Service | ToolNest';
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          By using ToolNest, you agree to these terms. Please read them carefully.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using ToolNest, you accept and agree to be bound by these Terms of Service.
          If you do not agree, please do not use our services.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          ToolNest provides free online tools for file conversion, image editing, text processing, 
          and calculations. All processing is done client-side in your browser. We do not store, 
          process, or transmit your files on our servers.
        </p>

        <h2>3. No Warranty</h2>
        <p>
          ToolNest is provided "as is" without warranties of any kind. We do not guarantee 
          that our tools will always work correctly or produce desired results. Always keep backups 
          of your original files.
        </p>

        <h2>4. Limitation of Liability</h2>
        <p>
          ToolNest and its operators shall not be liable for any damages arising from the use 
          or inability to use our services, including but not limited to data loss or corruption.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>
          You agree not to use ToolNest for any unlawful purpose or to process illegal content. 
          You are solely responsible for the files you process using our tools.
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use after changes 
          constitutes acceptance of the new terms.
        </p>
      </div>
    </div>
  );
}
