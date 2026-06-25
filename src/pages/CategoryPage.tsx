import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Image,
  Type,
  Table,
  Calculator,
  Maximize,
  Sparkles,
  ArrowRight,
  Wrench,
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
import { categories, getToolsByCategory } from '@/data/tools';
import type { ToolCategory } from '@/types';
import { useEffect } from 'react';
import { IconRenderer } from '@/components/tools/IconRenderer';

const categoryIconMap: Record<ToolCategory, React.ReactNode> = {
  pdf: <FileText className="w-6 h-6" />,
  image: <Image className="w-6 h-6" />,
  text: <Type className="w-6 h-6" />,
  spreadsheet: <Table className="w-6 h-6" />,
  calculator: <Calculator className="w-6 h-6" />,
  resize: <Maximize className="w-6 h-6" />,
  enhancer: <Sparkles className="w-6 h-6" />,
  developer: <Code className="w-6 h-6" />,
  video: <Video className="w-6 h-6" />,
  audio: <Music className="w-6 h-6" />,
  color: <Palette className="w-6 h-6" />,
  datetime: <Calendar className="w-6 h-6" />,
  security: <Lock className="w-6 h-6" />,
  document: <BookOpen className="w-6 h-6" />,
  archive: <FolderArchive className="w-6 h-6" />,
  network: <Globe className="w-6 h-6" />,
  social: <Share2 className="w-6 h-6" />,
  design: <Paintbrush className="w-6 h-6" />,
  productivity: <Briefcase className="w-6 h-6" />,
  fun: <Dices className="w-6 h-6" />,
  viral: <Rocket className="w-6 h-6" />,
  games: <Gamepad2 className="w-6 h-6" />,
  language: <Languages className="w-6 h-6" />,
  math: <Pi className="w-6 h-6" />,
  health: <HeartPulse className="w-6 h-6" />,
  finance: <IndianRupee className="w-6 h-6" />,
  education: <GraduationCap className="w-6 h-6" />,
  household: <Home className="w-6 h-6" />,
  travel: <Plane className="w-6 h-6" />,
  science: <FlaskConical className="w-6 h-6" />,
  geography: <Map className="w-6 h-6" />,
  wellness: <Heart className="w-6 h-6" />,
  planning: <ClipboardList className="w-6 h-6" />,
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cat = categories.find(c => c.id === category);
  const tools = cat ? getToolsByCategory(cat.id) : [];

  useEffect(() => {
    if (cat) {
      document.title = `${cat.name} - Free Online Tools | ToolNest`;
    }
  }, [cat]);

  if (!cat) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
        <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
        <Link to="/" className="text-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center`}>
          {categoryIconMap[cat.id]}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{cat.name}</h1>
          <p className="text-muted-foreground">{cat.description}</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.path}
            className="group rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4 text-left animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
              <IconRenderer name={tool.icon} className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1 truncate">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                  {tool.popular && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
