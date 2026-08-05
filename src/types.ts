export interface ParsedGithubUrl {
  originalUrl: string;
  user: string;
  repo: string;
  branch: string;
  path: string;
  fileName: string;
  fileExtension: string;
  fileCategory: 'javascript' | 'stylesheet' | 'image' | 'json' | 'markdown' | 'html' | 'font' | 'code' | 'other';
  isValid: boolean;
  error?: string;
}

export interface CdnService {
  id: string;
  name: string;
  description: string;
  tag: string;
  badgeColor: string;
  url: string;
  isFavorite?: boolean;
  note?: string;
}

export interface ConversionHistoryItem {
  id: string;
  timestamp: number;
  originalUrl: string;
  user: string;
  repo: string;
  branch: string;
  path: string;
  fileCategory: string;
}

export type Language = 'en' | 'hi';
