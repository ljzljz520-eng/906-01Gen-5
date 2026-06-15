import { useState } from 'react';
import { ShieldCheck, Check, X, Eye, FileX2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import { StatusBadge, LicenseBadge } from '../components/Badges';
import { Modal } from '../components/Modal';
import { CitationBlock } from '../components/CitationBlock';
import type { Dataset } from '../types';
import { useNavigate } from 'react-router-dom';

export function AdminReviewPage() {
  const navigate = useNavigate();
  const { currentUser, getPendingDatasets, reviewDataset } = useStore();
  const pending = getPendingDatasets();

  const [viewing, setViewing] = useState<Dataset | null>(null);
  const [reviewing, setReviewing] = useState<Dataset | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container py-16 animate-fade-in">
        <div className="max-w-xl mx-auto card p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-semibold text-academic-900 mb-2">
            权限不足
          </h2>
          <p className="text-academic-600 mb-5">该页面仅管理员可访问。</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = (ds: Dataset) => {
    reviewDataset(ds.id, 'approve');
    setReviewing(null);
  };

  const handleReject = (ds: Dataset) => {
    if (!rejectReason.trim()) return;
    reviewDataset(ds.id, 'reject', rejectReason.trim());
    setRejectReason('');
    setReviewing(null);
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-academic-900 mb-1 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-academic-700" />
            数据集审核管理
          </h1>
          <p className="text-sm text-academic-500">
            共 <span className="font-semibold text-warning-600">{pending.length}</span> 个待审核数据集
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="card p-16 text-center">
          <Check className="w-14 h-14 text-success-500 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-semibold text-academic-900 mb-1">
            暂无待审核数据集
          </h2>
          <p className="text-sm text-academic-500">所有提交均已处理，保持关注即可。</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-academic-50 border-b border-academic-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-academic-800">数据集</th>
                <th className="text-left px-5 py-3 font-semibold text-academic-800 hidden md:table-cell">领域</th>
                <th className="text-left px-5 py-3 font-semibold text-academic-800 hidden sm:table-cell">提交者</th>
                <th className="text-left px-5 py-3 font-semibold text-academic-800 hidden lg:table-cell">提交时间</th>
                <th className="text-left px-5 py-3 font-semibold text-academic-800">状态</th>
                <th className="text-right px-5 py-3 font-semibold text-academic-800">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-academic-100">
              {pending.map((ds) => (
                <tr key={ds.id} className="hover:bg-academic-50/60">
                  <td className="px-5 py-4">
                    <div className="font-medium text-academic-900 line-clamp-1">{ds.name}</div>
                    <div className="text-xs text-academic-500 mt-0.5 line-clamp-1">
                      {ds.authors.join(', ')}
                    </div>
                    <div className="mt-1.5">
                      <LicenseBadge license={ds.license} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-academic-700 hidden md:table-cell">{ds.domain}</td>
                  <td className="px-5 py-4 text-academic-700 hidden sm:table-cell">
                    {ds.submittedBy}
                  </td>
                  <td className="px-5 py-4 text-academic-500 hidden lg:table-cell">
                    {ds.publishedDate}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={ds.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewing(ds)}
                        className="btn-ghost !py-1.5 !px-2 text-sm"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setReviewing(ds)}
                        className="btn-ghost !py-1.5 !px-2 text-sm"
                        title="审核"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.name || '数据集详情'}
        size="lg"
      >
        {viewing && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
            <div className="flex flex-wrap gap-2">
              <LicenseBadge license={viewing.license} />
              <StatusBadge status={viewing.status} />
              <span className="badge bg-academic-50 text-academic-700">{viewing.domain}</span>
            </div>
            <div>
              <h4 className="label !mb-1">作者</h4>
              <div className="text-academic-800 text-sm">{viewing.authors.join(', ')}</div>
              {viewing.organization && (
                <div className="text-xs text-academic-500 mt-0.5">{viewing.organization}</div>
              )}
            </div>
            <div>
              <h4 className="label !mb-1">描述</h4>
              <p className="text-sm text-academic-700 leading-relaxed">{viewing.description}</p>
            </div>
            <div>
              <h4 className="label">字段定义</h4>
              <div className="overflow-x-auto rounded-lg border border-academic-100">
                <table className="w-full text-xs">
                  <thead className="bg-academic-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-academic-700">字段</th>
                      <th className="text-left px-3 py-2 font-semibold text-academic-700">类型</th>
                      <th className="text-left px-3 py-2 font-semibold text-academic-700">描述</th>
                      <th className="text-left px-3 py-2 font-semibold text-academic-700">示例</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-academic-100">
                    {viewing.fields.map((f) => (
                      <tr key={f.name}>
                        <td className="px-3 py-2 font-mono">{f.name}</td>
                        <td className="px-3 py-2">{f.type}</td>
                        <td className="px-3 py-2">{f.description}</td>
                        <td className="px-3 py-2 font-mono">{f.example || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="label">引用格式</h4>
              <CitationBlock citation={viewing.citation} />
            </div>
            <div>
              <h4 className="label">使用限制</h4>
              <ul className="list-disc pl-5 text-sm text-academic-700 space-y-1">
                {viewing.usageRestrictions.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!reviewing}
        onClose={() => {
          setReviewing(null);
          setRejectReason('');
        }}
        title={`审核：${reviewing?.name || ''}`}
        size="sm"
      >
        {reviewing && (
          <div>
            <p className="text-sm text-academic-600 mb-4">
              请审核此数据集的元数据质量、许可证合规性与描述准确性。
            </p>
            <div className="rounded-lg border border-danger-200 bg-danger-50/60 p-3 mb-4">
              <div className="text-xs font-semibold text-danger-700 mb-1.5 flex items-center gap-1">
                <FileX2 className="w-3.5 h-3.5" />
                驳回原因（仅驳回时填写）
              </div>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请说明驳回此数据集的原因，将发送给提交者…"
                className="input !bg-white !py-2 resize-none text-sm"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setReviewing(null);
                  setRejectReason('');
                }}
                className="btn-outline"
              >
                取消
              </button>
              <button
                onClick={() => handleReject(reviewing)}
                disabled={!rejectReason.trim()}
                className="btn-danger"
              >
                <X className="w-4 h-4" /> 驳回
              </button>
              <button onClick={() => handleApprove(reviewing)} className="btn-success">
                <Check className="w-4 h-4" /> 通过审核
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
