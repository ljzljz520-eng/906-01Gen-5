import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Heart,
  Calendar,
  User2,
  Building2,
  Globe,
  FileBadge,
  AlertTriangle,
  Check,
  Clock,
  TrendingUp,
  FileX2,
  Lock,
} from 'lucide-react';
import type { Dataset } from '../types';
import { useStore } from '../store';
import { CitationBlock } from '../components/CitationBlock';
import { LicenseBadge, StatusBadge } from '../components/Badges';
import { Modal } from '../components/Modal';
import { NotFoundPage } from './NotFoundPage';

function buildDownloadFile(ds: Dataset): string {
  const payload = {
    dataset: {
      id: ds.id,
      name: ds.name,
      authors: ds.authors,
      organization: ds.organization,
      domain: ds.domain,
      license: ds.license,
      doi: ds.doi,
      collectionDate: ds.collectionDate,
      publishedDate: ds.publishedDate,
      description: ds.description,
    },
    schema: ds.fields.map((f) => ({
      field: f.name,
      type: f.type,
      description: f.description,
      example: f.example,
    })),
    citation: ds.citation,
    usageRestrictions: ds.usageRestrictions,
    downloadedAt: new Date().toISOString(),
    source: 'DataCite Hub',
  };
  return JSON.stringify(payload, null, 2);
}

function triggerBrowserDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DatasetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getDatasetById,
    currentUser,
    toggleFavorite,
    recordDownload,
    retractDataset,
    reviseDataset,
  } = useStore();

  const dataset = id ? getDatasetById(id) : undefined;

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showRetractModal, setShowRetractModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [retractReason, setRetractReason] = useState('');
  const [reviseChanges, setReviseChanges] = useState('');
  const [favAnim, setFavAnim] = useState(false);

  if (!dataset) {
    return <NotFoundPage />;
  }

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = currentUser?.id === dataset.submittedBy;
  const canViewPrivate =
    dataset.status === 'approved' ||
    dataset.status === 'retracted' ||
    isAdmin ||
    isOwner;

  if (!canViewPrivate) {
    return (
      <div className="container py-20 animate-fade-in">
        <div className="max-w-xl mx-auto card p-10 text-center">
          <Lock className="w-14 h-14 text-warning-500 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-semibold text-academic-900 mb-2">
            该数据集暂未公开
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <StatusBadge status={dataset.status} />
          </div>
          <p className="text-academic-600 mb-6 leading-relaxed">
            此数据集当前处于
            <span className="font-semibold text-academic-800 mx-1">
              {dataset.status === 'pending' ? '待审核' : '已驳回'}
            </span>
            状态，仅提交者本人和管理员可以查看。
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/datasets" className="btn-outline">
              <ArrowLeft className="w-4 h-4" /> 返回列表
            </Link>
            {!currentUser && (
              <Link to="/login" className="btn-primary">
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isFavorited =
    currentUser?.favoriteDatasetIds.includes(dataset.id) || false;
  const isRetracted = dataset.status === 'retracted';
  const canDownload = dataset.status === 'approved' && !isRetracted;

  const handleToggleFav = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (dataset.status !== 'approved') return;
    toggleFavorite(currentUser.id, dataset.id);
    setFavAnim(true);
    setTimeout(() => setFavAnim(false), 400);
  };

  const handleDownload = () => {
    if (!agreed || !canDownload) return;
    const safeName = dataset.name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 60);
    const version = dataset.revisions[0]?.version || '1.0';
    triggerBrowserDownload(
      `${safeName}__v${version}__datacite-hub.json`,
      buildDownloadFile(dataset),
    );
    recordDownload(dataset.id);
    setShowDownloadModal(false);
    setAgreed(false);
  };

  const handleRetract = () => {
    if (!retractReason.trim()) return;
    retractDataset(dataset.id, retractReason.trim());
    setShowRetractModal(false);
    setRetractReason('');
  };

  const handleRevise = () => {
    if (!reviseChanges.trim()) return;
    reviseDataset(dataset.id, reviseChanges.trim());
    setShowReviseModal(false);
    setReviseChanges('');
  };

  return (
    <div className="container py-8 animate-fade-in">
      <Link
        to="/datasets"
        className="inline-flex items-center gap-1.5 text-sm text-academic-600 hover:text-academic-900 transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> 返回数据集列表
      </Link>

      {isRetracted && (
        <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 p-5 flex items-start gap-3">
          <FileX2 className="w-6 h-6 text-danger-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-danger-800">该数据集已被撤稿</h3>
            <p className="text-sm text-danger-700 mt-1">
              {dataset.revisions.find((r) => r.type === 'retraction')?.changes ||
                '因数据问题已被管理员撤稿，请谨慎使用。'}
            </p>
          </div>
        </div>
      )}

      {dataset.status === 'pending' && (isAdmin || isOwner) && (
        <div className="mb-6 rounded-xl border border-warning-200 bg-warning-50 p-5 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-warning-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-warning-800">该数据集正在等待审核</h3>
            <p className="text-sm text-warning-700 mt-1">
              此页面仅您和管理员可见，审核通过后将在平台公开发布。
            </p>
          </div>
        </div>
      )}

      {dataset.status === 'rejected' && (isAdmin || isOwner) && (
        <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 p-5 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-danger-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-danger-800">该数据集未通过审核</h3>
            <p className="text-sm text-danger-700 mt-1">
              驳回原因：{dataset.rejectionReason || '未提供原因'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="card p-7">
            <div className="flex items-start gap-3 flex-wrap mb-4">
              <LicenseBadge license={dataset.license} />
              <StatusBadge status={dataset.status} />
              <span className="badge bg-academic-50 text-academic-700 border border-academic-100">
                {dataset.domain}
              </span>
              {dataset.doi && (
                <span className="badge bg-success-50 text-success-800 border border-success-200">
                  <FileBadge className="w-3 h-3" /> DOI: {dataset.doi}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-academic-900 leading-tight mb-4">
              {dataset.name}
            </h1>
            <p className="text-academic-700 leading-relaxed">{dataset.description}</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <User2 className="w-4 h-4 text-academic-500 mt-0.5" />
                <div>
                  <div className="text-xs text-academic-500">作者</div>
                  <div className="text-academic-800">{dataset.authors.join(', ')}</div>
                </div>
              </div>
              {dataset.organization && (
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-academic-500 mt-0.5" />
                  <div>
                    <div className="text-xs text-academic-500">机构</div>
                    <div className="text-academic-800">{dataset.organization}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-academic-500 mt-0.5" />
                <div>
                  <div className="text-xs text-academic-500">数据采集时间</div>
                  <div className="text-academic-800">{dataset.collectionDate}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-academic-500 mt-0.5" />
                <div>
                  <div className="text-xs text-academic-500">发布时间</div>
                  <div className="text-academic-800">{dataset.publishedDate}</div>
                </div>
              </div>
              {dataset.revisions.length > 0 && (
                <div className="flex items-start gap-2.5 sm:col-span-2">
                  <TrendingUp className="w-4 h-4 text-academic-500 mt-0.5" />
                  <div>
                    <div className="text-xs text-academic-500">当前版本</div>
                    <div className="text-academic-800">
                      v{dataset.revisions[0].version}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-7">
            <h2 className="subsection-title flex items-center gap-2">
              <FileBadge className="w-4 h-4" /> 字段说明
            </h2>
            <div className="overflow-x-auto -mx-7">
              <table className="min-w-full text-sm">
                <thead className="bg-academic-50">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-academic-800">字段名</th>
                    <th className="text-left px-5 py-3 font-semibold text-academic-800">类型</th>
                    <th className="text-left px-5 py-3 font-semibold text-academic-800">描述</th>
                    <th className="text-left px-5 py-3 font-semibold text-academic-800">示例</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-academic-100">
                  {dataset.fields.map((f) => (
                    <tr key={f.name} className="hover:bg-academic-50/60">
                      <td className="px-5 py-3 font-mono text-xs text-academic-900 font-medium">
                        {f.name}
                      </td>
                      <td className="px-5 py-3">
                        <span className="badge bg-academic-50 text-academic-700 font-mono">
                          {f.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-academic-700">{f.description}</td>
                      <td className="px-5 py-3 font-mono text-xs text-academic-600">
                        {f.example || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-7">
            <h2 className="subsection-title flex items-center gap-2">
              <Globe className="w-4 h-4" /> 推荐引用格式
            </h2>
            <CitationBlock citation={dataset.citation} />
          </div>

          {dataset.revisions.length > 0 && (
            <div className="card p-7">
              <h2 className="subsection-title flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> 修订历史
              </h2>
              <ol className="relative border-l border-academic-200 ml-3 space-y-5">
                {dataset.revisions.map((r, idx) => (
                  <li key={idx} className="ml-6">
                    <span
                      className={`absolute -left-2.5 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white ${
                        r.type === 'retraction'
                          ? 'bg-danger-500'
                          : idx === 0
                          ? 'bg-success-600'
                          : 'bg-academic-400'
                      }`}
                    >
                      {idx === 0 && r.type !== 'retraction' && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </span>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                          r.type === 'retraction'
                            ? 'bg-danger-100 text-danger-700'
                            : 'bg-success-100 text-success-800'
                        }`}
                      >
                        v{r.version}
                      </span>
                      <span className="text-xs text-academic-500">{r.date}</span>
                      {r.type === 'retraction' && (
                        <span className="badge bg-danger-50 text-danger-700">已撤稿</span>
                      )}
                    </div>
                    <p className="text-sm text-academic-700">{r.changes}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-6 sticky top-20">
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-academic-100">
              <div className="flex items-center gap-1.5 text-sm text-academic-600">
                <Download className="w-4 h-4" />
                <span>{dataset.downloads.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-academic-600">
                <Heart className="w-4 h-4" />
                <span>{dataset.favorites.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleToggleFav}
              disabled={!canDownload}
              className={`w-full btn-outline mb-3 ${favAnim ? 'animate-bounce-soft' : ''} disabled:opacity-50`}
              title={!canDownload ? '仅已公开数据集可收藏' : undefined}
            >
              <Heart
                className={`w-4 h-4 ${isFavorited ? 'fill-danger-500 text-danger-500' : ''}`}
              />
              {isFavorited ? '已收藏' : canDownload ? '收藏数据集' : '不可收藏'}
            </button>

            <button
              onClick={() => setShowDownloadModal(true)}
              disabled={!canDownload}
              className="w-full btn-primary"
            >
              <Download className="w-4 h-4" />
              {!canDownload
                ? dataset.status === 'pending'
                  ? '审核中，暂不可下载'
                  : dataset.status === 'rejected'
                  ? '已驳回，无法下载'
                  : '已撤稿，无法下载'
                : '下载数据集'}
            </button>

            {isAdmin && !isRetracted && dataset.status === 'approved' && (
              <div className="mt-5 pt-5 border-t border-academic-100 space-y-2">
                <div className="text-xs font-semibold text-academic-500 uppercase tracking-wider mb-2">
                  管理员操作
                </div>
                <button
                  onClick={() => setShowReviseModal(true)}
                  className="w-full btn-outline !py-2"
                >
                  <TrendingUp className="w-4 h-4" /> 发布修订版本
                </button>
                <button
                  onClick={() => setShowRetractModal(true)}
                  className="w-full btn-danger !py-2"
                >
                  <FileX2 className="w-4 h-4" /> 撤稿数据集
                </button>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-start gap-2.5 mb-3">
              <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
              <h3 className="font-semibold text-warning-800 text-sm">使用限制与条款</h3>
            </div>
            <ul className="space-y-2">
              {dataset.usageRestrictions.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-academic-700">
                  <Check className="w-4 h-4 text-success-700 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Modal
        open={showDownloadModal}
        onClose={() => {
          setShowDownloadModal(false);
          setAgreed(false);
        }}
        title="下载确认 — 使用条款"
      >
        <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-warning-800 text-sm mb-1.5">请仔细阅读以下条款</h4>
              <ul className="space-y-1.5 text-sm text-warning-800">
                {dataset.usageRestrictions.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer select-none mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-academic-300 text-academic-800 focus:ring-academic-600"
          />
          <span className="text-sm text-academic-700">
            我已阅读并同意上述使用条款与许可证要求，承诺在引用该数据集时使用平台提供的推荐引用格式。
          </span>
        </label>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setShowDownloadModal(false);
              setAgreed(false);
            }}
            className="btn-outline"
          >
            取消
          </button>
          <button
            onClick={handleDownload}
            disabled={!agreed}
            className="btn-primary"
          >
            <Download className="w-4 h-4" /> 确认下载
          </button>
        </div>
      </Modal>

      <Modal
        open={showRetractModal}
        onClose={() => {
          setShowRetractModal(false);
          setRetractReason('');
        }}
        title="撤稿数据集"
        size="sm"
      >
        <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          撤稿操作将通知所有收藏此数据集的用户，请谨慎执行。
        </div>
        <label className="label">撤稿原因</label>
        <textarea
          value={retractReason}
          onChange={(e) => setRetractReason(e.target.value)}
          rows={4}
          placeholder="请说明撤稿原因…"
          className="input mb-5 resize-none"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setShowRetractModal(false);
              setRetractReason('');
            }}
            className="btn-outline"
          >
            取消
          </button>
          <button
            onClick={handleRetract}
            disabled={!retractReason.trim()}
            className="btn-danger"
          >
            确认撤稿
          </button>
        </div>
      </Modal>

      <Modal
        open={showReviseModal}
        onClose={() => {
          setShowReviseModal(false);
          setReviseChanges('');
        }}
        title="发布修订版本"
        size="sm"
      >
        <div className="mb-4 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-800">
          修订发布后将通知所有收藏此数据集的用户。
        </div>
        <label className="label">变更说明</label>
        <textarea
          value={reviseChanges}
          onChange={(e) => setReviseChanges(e.target.value)}
          rows={4}
          placeholder="请描述此版本的变更内容…"
          className="input mb-5 resize-none"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setShowReviseModal(false);
              setReviseChanges('');
            }}
            className="btn-outline"
          >
            取消
          </button>
          <button
            onClick={handleRevise}
            disabled={!reviseChanges.trim()}
            className="btn-success"
          >
            发布修订
          </button>
        </div>
      </Modal>
    </div>
  );
}
