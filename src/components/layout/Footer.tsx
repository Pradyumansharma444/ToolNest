import { Link } from 'react-router-dom';
import { Wrench, Github, Twitter, Heart } from 'lucide-react';
import { categories } from '@/data/tools';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <img src="/logo.png" alt="ToolNest Logo" className="w-8 h-8 object-contain" />
              <span>ToolNest</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Free, privacy-first online tools. All processing happens in your browser.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-3">Tools</h4>
            <ul className="space-y-1.5">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/${cat.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <div className="flex gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Clivo Technologies. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> for privacy
          </p>
        </div>
      </div>
    </footer>
  );
}
