export type DatasetStatus = 'pending' | 'approved' | 'rejected' | 'retracted';

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

export interface DatasetField {
  name: string;
  type: FieldType;
  description: string;
  example?: string;
}

export interface CitationFormat {
  bibtex: string;
  apa: string;
  mla: string;
}

export type RevisionType = 'update' | 'retraction';

export interface Revision {
  version: string;
  date: string;
  changes: string;
  type: RevisionType;
}

export interface Dataset {
  id: string;
  name: string;
  authors: string[];
  organization?: string;
  collectionDate: string;
  publishedDate: string;
  license: string;
  domain: string;
  description: string;
  fields: DatasetField[];
  citation: CitationFormat;
  usageRestrictions: string[];
  status: DatasetStatus;
  rejectionReason?: string;
  downloads: number;
  favorites: number;
  revisions: Revision[];
  submittedBy: string;
  doi?: string;
}

export type UserRole = 'visitor' | 'researcher' | 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  organization?: string;
  role: UserRole;
  avatar?: string;
  favoriteDatasetIds: string[];
  password?: string;
}

export type NotificationType = 'review_result' | 'dataset_retracted' | 'dataset_updated' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  datasetId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DatasetFilters {
  domain?: string;
  license?: string;
  yearFrom?: number;
  yearTo?: number;
  sortBy?: 'newest' | 'oldest' | 'downloads' | 'favorites';
  keyword?: string;
}

export type CitationFormatKey = 'bibtex' | 'apa' | 'mla';

export const DOMAINS = [
  '计算机科学',
  '医学与健康',
  '环境科学',
  '天文学与天体物理',
  '社会科学',
  '生物学',
  '物理学',
  '经济学',
];

export const LICENSES = [
  'CC0 (Public Domain)',
  'CC BY (Attribution)',
  'CC BY-SA (Attribution-ShareAlike)',
  'CC BY-NC (Attribution-NonCommercial)',
  'CC BY-NC-SA (Attribution-NonCommercial-ShareAlike)',
  'MIT License',
  'Custom',
];
