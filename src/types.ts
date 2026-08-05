export interface DownloadItem {
  id: string;
  url: string;
  platform: string;
  title: string;
  thumbnail: string;
  duration?: string;
  format: 'video' | 'audio';
  downloadUrl: string;
  timestamp: number;
}

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  pattern: RegExp;
  placeholderUrl: string;
}

export interface AiAnalysisResult {
  titles: {
    viral: string;
    descriptive: string;
    clean: string;
  };
  hashtags: string[];
  description: string;
  tags: string[];
  category: string;
}
