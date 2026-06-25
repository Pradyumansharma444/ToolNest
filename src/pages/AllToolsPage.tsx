import { Link } from 'react-router-dom';
import {
  FileText,
  Image,
  Type,
  Table,
  Calculator,
  Maximize,
  Sparkles,
  ArrowRight,
  Code,
  Video,
  Music,
  Palette,
  Calendar,
  Lock,
  BookOpen,
  FolderArchive,
  Globe,
  Share2,
  Paintbrush,
  Briefcase,
  Dices,
  Rocket,
  Gamepad2,
  Languages,
  Pi,
  HeartPulse,
  IndianRupee,
  GraduationCap,
  Home,
  Plane,
  FlaskConical,
  Map,
  Heart,
  ClipboardList,
} from 'lucide-react';
import { categories, tools } from '@/data/tools';
import type { ToolCategory } from '@/types';
import { useEffect } from 'react';
import { IconRenderer } from '@/components/tools/IconRenderer';

const categoryIconMap: Record<ToolCategory, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5" />,
  image: <Image className="w-5 h-5" />,
  text: <Type className="w-5 h-5" />,
  spreadsheet: <Table className="w-5 h-5" />,
  calculator: <Calculator className="w-5 h-5" />,
  resize: <Maximize className="w-5 h-5" />,
  enhancer: <Sparkles className="w-5 h-5" />,
  developer: <Code className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  audio: <Music className="w-5 h-5" />,
  color: <Palette className="w-5 h-5" />,
  datetime: <Calendar className="w-5 h-5" />,
  security: <Lock className="w-5 h-5" />,
  document: <BookOpen className="w-5 h-5" />,
  archive: <FolderArchive className="w-5 h-5" />,
  network: <Globe className="w-5 h-5" />,
  social: <Share2 className="w-5 h-5" />,
  design: <Paintbrush className="w-5 h-5" />,
  productivity: <Briefcase className="w-5 h-5" />,
  fun: <Dices className="w-5 h-5" />,
  viral: <Rocket className="w-5 h-5" />,
  games: <Gamepad2 className="w-5 h-5" />,
  language: <Languages className="w-5 h-5" />,
  math: <Pi className="w-5 h-5" />,
  health: <HeartPulse className="w-5 h-5" />,
  finance: <IndianRupee className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  household: <Home className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
  science: <FlaskConical className="w-5 h-5" />,
  geography: <Map className="w-5 h-5" />,
  wellness: <Heart className="w-5 h-5" />,
  planning: <ClipboardList className="w-5 h-5" />,
};

export default function AllToolsPage() {
  useEffect(() => {
    document.title = 'All Tools | ToolNest';
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">All Tools</h1>
      <p className="text-muted-foreground mb-8">
        {tools.length} free tools across {categories.length} categories
      </p>

      <div className="space-y-10">
        {categories.map((cat) => {
          const catTools = tools.filter(t => t.category === cat.id);
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} text-white flex items-center justify-center`}>
                  {categoryIconMap[cat.id]}
                </div>
                <h2 className="text-xl font-semibold">{cat.name}</h2>
                <span className="text-sm text-muted-foreground">({catTools.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="group flex items-center gap-3 rounded-lg border bg-card p-3.5 hover:shadow-sm hover:border-primary/30 hover:scale-[1.01] transition-all text-left animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                      <IconRenderer name={tool.icon} className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium group-hover:text-primary transition-colors text-sm truncate">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tool.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-auto" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
