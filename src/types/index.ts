export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  path: string;
  icon: string;
  popular?: boolean;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  instructions?: string[];
}

export type ToolCategory =
  | 'pdf'
  | 'image'
  | 'text'
  | 'spreadsheet'
  | 'calculator'
  | 'resize'
  | 'enhancer'
  | 'developer'
  | 'video'
  | 'audio'
  | 'color'
  | 'datetime'
  | 'security'
  | 'document'
  | 'archive'
  | 'network'
  | 'social'
  | 'design'
  | 'productivity'
  | 'fun'
  | 'viral'
  | 'games'
  | 'language'
  | 'math'
  | 'health'
  | 'finance'
  | 'education'
  | 'household'
  | 'travel'
  | 'science'
  | 'geography'
  | 'wellness'
  | 'planning';

export interface Category {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface FavoriteTool {
  id: string;
  addedAt: number;
}

export interface ToolUsage {
  toolId: string;
  count: number;
  lastUsed: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface PdfPage {
  pageNum: number;
  thumbnail: string;
  width: number;
  height: number;
}

export interface ImageFile {
  file: File;
  id: string;
  preview: string;
  width: number;
  height: number;
  size: number;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}
