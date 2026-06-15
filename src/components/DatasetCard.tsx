import { Link } from 'react-router-dom';
import { Download, Heart, Calendar, User2, BookOpen } from 'lucide-react';
import type { Dataset } from '../types';
import { LicenseBadge, StatusBadge } from './Badges';

interface Props {
  dataset: Dataset;
  compact?: boolean;
}

export function DatasetCard({ dataset, compact = false }: Props) {
  return (
    <Link
      to={`/datasets/${dataset.id}`}
      className="card card-hover p-5 block group h-full flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <LicenseBadge license={dataset.license} />
          {dataset.status !== 'approved' && <StatusBadge status={dataset.status} />}
        </div>
        <span className="text-[11px] text-academic-500 bg-academic-50 px-2 py-0.5 rounded-full whitespace-nowrap">
          {dataset.domain}
        </span>
      </div>

      <h3 className="font-serif text-lg font-semibold text-academic-900 leading-snug mb-2 group-hover:text-academic-700 transition-colors line-clamp-2">
        {dataset.name}
      </h3>

      {!compact && (
        <p className="text-sm text-academic-600 leading-relaxed line-clamp-2 mb-4">
          {dataset.description}
        </p>
      )}

      <div className="mt-auto space-y-2 pt-4 border-t border-academic-50">
        <div className="flex items-center gap-1.5 text-xs text-academic-500">
          <User2 className="w-3.5 h-3.5" />
          <span className="truncate">{dataset.authors.slice(0, 2).join(', ')}
            {dataset.authors.length > 2 && ` 等${dataset.authors.length}人`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-academic-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>发布于 {dataset.publishedDate}</span>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1 text-xs text-academic-500">
            <Download className="w-3.5 h-3.5" />
            <span>{dataset.downloads.toLocaleString()} 下载</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-academic-500">
            <Heart className="w-3.5 h-3.5" />
            <span>{dataset.favorites.toLocaleString()} 收藏</span>
          </div>
          {dataset.doi && (
            <div className="flex items-center gap-1 text-xs text-academic-500 ml-auto">
              <BookOpen className="w-3.5 h-3.5" />
              <span>DOI</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
