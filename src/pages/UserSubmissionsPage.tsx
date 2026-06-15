import { Navigate, Link } from 'react-router-dom';
import { FileText, Plus, Clock } from 'lucide-react';
import { useStore } from '../store';
import { UserSidebar } from '../components/Layout';
import { StatusBadge, LicenseBadge } from '../components/Badges';

export function UserSubmissionsPage() {
  const { currentUser, getUserSubmissions } = useStore();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/user/submissions' }} replace />;
  }

  const canSubmit = currentUser.role === 'researcher' || currentUser.role === 'admin';
  const submissions = getUserSubmissions(currentUser.id).sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
  );

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <UserSidebar />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-academic-900 mb-1 flex items-center gap-2">
                <FileText className="w-6 h-6 text-academic-700" />
                我的提交
              </h1>
              <p className="text-sm text-academic-500">
                共提交 {submissions.length} 个数据集
              </p>
            </div>
            {canSubmit && (
              <Link to="/submit" className="btn-primary">
                <Plus className="w-4 h-4" /> 提交新数据集
              </Link>
            )}
          </div>

          {!canSubmit && (
            <div className="mb-5 rounded-lg border border-warning-200 bg-warning-50 p-4 flex items-start gap-2.5">
              <Clock className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
              <div className="text-sm text-warning-800">
                提交数据集需要<strong>研究人员</strong>身份，您可以在个人资料中申请或升级账号角色。
              </div>
            </div>
          )}

          {submissions.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="w-12 h-12 text-academic-300 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-semibold text-academic-800 mb-1">
                还没有提交任何数据集
              </h3>
              <p className="text-sm text-academic-500 mb-4">
                分享您的研究数据，让更多科研工作者受益
              </p>
              {canSubmit ? (
                <Link to="/submit" className="btn-primary">
                  立即提交
                </Link>
              ) : (
                <span className="text-xs text-academic-500">请先升级为研究人员角色</span>
              )}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-academic-50 border-b border-academic-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-academic-800">数据集</th>
                    <th className="text-left px-5 py-3 font-semibold text-academic-800 hidden md:table-cell">领域</th>
                    <th className="text-left px-5 py-3 font-semibold text-academic-800 hidden lg:table-cell">提交时间</th>
                    <th className="text-left px-5 py-3 font-semibold text-academic-800">状态</th>
                    <th className="text-right px-5 py-3 font-semibold text-academic-800 hidden sm:table-cell">下载/收藏</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-academic-100">
                  {submissions.map((ds) => (
                    <tr key={ds.id} className="hover:bg-academic-50/60">
                      <td className="px-5 py-4">
                        <Link
                          to={`/datasets/${ds.id}`}
                          className="font-medium text-academic-900 hover:text-academic-700 line-clamp-1"
                        >
                          {ds.name}
                        </Link>
                        <div className="mt-1.5">
                          <LicenseBadge license={ds.license} />
                        </div>
                        {ds.rejectionReason && (
                          <div className="text-xs text-danger-600 mt-1.5">
                            驳回原因：{ds.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-academic-700 hidden md:table-cell">{ds.domain}</td>
                      <td className="px-5 py-4 text-academic-500 hidden lg:table-cell">{ds.publishedDate}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={ds.status} />
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-academic-500 hidden sm:table-cell">
                        {ds.downloads.toLocaleString()} / {ds.favorites.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
