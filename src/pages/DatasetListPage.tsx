import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { DatasetCard } from '../components/DatasetCard';
import { DOMAINS, LICENSES, type DatasetFilters } from '../types';

const sortOptions: { key: NonNullable<DatasetFilters['sortBy']>; label: string }[] = [
  { key: 'newest', label: '最新发布' },
  { key: 'oldest', label: '最早发布' },
  { key: 'downloads', label: '下载最多' },
  { key: 'favorites', label: '收藏最多' },
];

export function DatasetListPage() {
  const { getApprovedDatasets } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [domain, setDomain] = useState(searchParams.get('domain') || '');
  const [license, setLicense] = useState(searchParams.get('license') || '');
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') || '');
  const [sortBy, setSortBy] = useState<NonNullable<DatasetFilters['sortBy']>>(
    (searchParams.get('sort') as NonNullable<DatasetFilters['sortBy']>) || 'newest',
  );
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (keyword) params.keyword = keyword;
    if (domain) params.domain = domain;
    if (license) params.license = license;
    if (yearFrom) params.yearFrom = yearFrom;
    if (yearTo) params.yearTo = yearTo;
    if (sortBy) params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [keyword, domain, license, yearFrom, yearTo, sortBy, setSearchParams]);

  const datasets = useMemo(
    () =>
      getApprovedDatasets({
        keyword,
        domain: domain || undefined,
        license: license || undefined,
        yearFrom: yearFrom ? Number(yearFrom) : undefined,
        yearTo: yearTo ? Number(yearTo) : undefined,
        sortBy,
      }),
    [getApprovedDatasets, keyword, domain, license, yearFrom, yearTo, sortBy],
  );

  const filters = useMemo(
    () => [
      { label: '关键词', value: keyword, clear: () => setKeyword('') },
      { label: '领域', value: domain, clear: () => setDomain('') },
      { label: '许可证', value: license, clear: () => setLicense('') },
      { label: '起始年份', value: yearFrom, clear: () => setYearFrom('') },
      { label: '结束年份', value: yearTo, clear: () => setYearTo('') },
    ].filter((f) => f.value),
    [keyword, domain, license, yearFrom, yearTo],
  );

  const clearAll = () => {
    setKeyword('');
    setDomain('');
    setLicense('');
    setYearFrom('');
    setYearTo('');
  };

  const FilterSidebar = (
    <div className="space-y-5">
      <div>
        <label className="label">关键词搜索</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索名称、作者…"
            className="input !pl-9"
          />
        </div>
      </div>

      <div>
        <label className="label">研究领域</label>
        <div className="relative">
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="input appearance-none pr-9"
          >
            <option value="">全部领域</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
        </div>
      </div>

      <div>
        <label className="label">许可证类型</label>
        <div className="relative">
          <select
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            className="input appearance-none pr-9"
          >
            <option value="">全部许可证</option>
            {LICENSES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">起始年份</label>
          <input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            placeholder="2015"
            className="input"
          />
        </div>
        <div>
          <label className="label">结束年份</label>
          <input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            placeholder="2025"
            className="input"
          />
        </div>
      </div>

      {(keyword || domain || license || yearFrom || yearTo) && (
        <button
          onClick={clearAll}
          className="w-full btn-outline text-sm"
        >
          <X className="w-4 h-4" /> 清除筛选
        </button>
      )}
    </div>
  );

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-academic-900 mb-1">
          数据集目录
        </h1>
        <p className="text-sm text-academic-500">
          共找到 <span className="font-semibold text-academic-800">{datasets.length}</span> 个符合条件的数据集
        </p>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-academic-500 mr-1">已选筛选：</span>
          {filters.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-academic-100 text-academic-700 text-xs"
            >
              {f.label}: <span className="font-medium">{f.value}</span>
              <button
                onClick={f.clear}
                className="hover:text-academic-900 transition-colors"
                aria-label={`清除 ${f.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          onClick={() => setShowMobileFilter(true)}
          className="lg:hidden inline-flex items-center gap-1.5 btn-outline"
        >
          <Filter className="w-4 h-4" /> 筛选
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-academic-500" />
          <span className="text-sm text-academic-500 hidden sm:inline">排序：</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input appearance-none !py-2 !pr-8 !pl-3 text-sm min-w-[130px]"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="card p-5 sticky top-20">{FilterSidebar}</div>
        </aside>

        <div>
          {datasets.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-academic-400 mb-3">
                <Search className="w-12 h-12 mx-auto opacity-60" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-academic-800 mb-1">
                未找到匹配的数据集
              </h3>
              <p className="text-sm text-academic-500 mb-4">
                请尝试调整搜索关键词或筛选条件
              </p>
              <button onClick={clearAll} className="btn-primary">
                重置筛选
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {datasets.map((d) => (
                <DatasetCard key={d.id} dataset={d} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div
            className="absolute inset-0 bg-academic-900/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="relative w-full bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-lg font-semibold text-academic-900">筛选条件</h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-1.5 rounded-md text-academic-500 hover:bg-academic-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterSidebar}
          </div>
        </div>
      )}
    </div>
  );
}
