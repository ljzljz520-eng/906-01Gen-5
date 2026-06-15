import { Navigate } from 'react-router-dom';
import { User as UserIcon, Building2, Mail, ShieldCheck, Heart, Download, FileText } from 'lucide-react';
import { useStore } from '../store';
import { UserSidebar } from '../components/Layout';
import { RoleBadge } from '../components/Badges';

export function UserProfilePage() {
  const { currentUser, getUserFavorites, getUserSubmissions, getApprovedDatasets } = useStore();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/user/profile' }} replace />;
  }

  const favorites = getUserFavorites(currentUser.id);
  const submissions = getUserSubmissions(currentUser.id);
  const approvedSubs = submissions.filter((s) => s.status === 'approved');
  const totalApprovedDownloads = approvedSubs.reduce((s, d) => s + d.downloads, 0);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <UserSidebar />

        <div className="flex-1 space-y-6">
          <div className="card p-7">
            <h2 className="section-title !mb-5">个人资料</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="shrink-0 flex sm:block justify-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-academic-600 to-academic-800 flex items-center justify-center text-white text-3xl font-serif font-semibold shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <div className="text-xs text-academic-500 uppercase tracking-wider mb-1">姓名</div>
                  <div className="flex items-center gap-2 text-academic-900 font-medium">
                    <UserIcon className="w-4 h-4 text-academic-400" />
                    {currentUser.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-academic-500 uppercase tracking-wider mb-1">邮箱</div>
                  <div className="flex items-center gap-2 text-academic-800">
                    <Mail className="w-4 h-4 text-academic-400" />
                    {currentUser.email}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-academic-500 uppercase tracking-wider mb-1">所属机构</div>
                  <div className="flex items-center gap-2 text-academic-800">
                    <Building2 className="w-4 h-4 text-academic-400" />
                    {currentUser.organization || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-academic-500 uppercase tracking-wider mb-1">账号角色</div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-academic-400" />
                    <RoleBadge role={currentUser.role} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-xs text-academic-500 uppercase tracking-wider">我的收藏</div>
              </div>
              <div className="font-serif text-3xl font-bold text-academic-900">{favorites.length}</div>
              <div className="text-xs text-academic-500 mt-0.5">个数据集</div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-academic-50 text-academic-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-xs text-academic-500 uppercase tracking-wider">我的提交</div>
              </div>
              <div className="font-serif text-3xl font-bold text-academic-900">{submissions.length}</div>
              <div className="text-xs text-academic-500 mt-0.5">
                已通过 {approvedSubs.length} 个
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-success-50 text-success-700 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div className="text-xs text-academic-500 uppercase tracking-wider">贡献下载</div>
              </div>
              <div className="font-serif text-3xl font-bold text-academic-900">
                {totalApprovedDownloads.toLocaleString()}
              </div>
              <div className="text-xs text-academic-500 mt-0.5">次总下载</div>
            </div>
          </div>

          <div className="card p-7">
            <h3 className="subsection-title">使用指引</h3>
            <ul className="space-y-2.5 text-sm text-academic-700">
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-academic-100 text-academic-700 text-xs font-semibold shrink-0">
                  1
                </span>
                浏览数据集目录，发现感兴趣的研究资源。
              </li>
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-academic-100 text-academic-700 text-xs font-semibold shrink-0">
                  2
                </span>
                下载前请仔细阅读使用限制与推荐引用格式。
              </li>
              <li className="flex gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-academic-100 text-academic-700 text-xs font-semibold shrink-0">
                  3
                </span>
                收藏感兴趣的数据集，修订或撤稿时会收到通知。
              </li>
              {currentUser.role === 'researcher' || currentUser.role === 'admin' ? (
                <li className="flex gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-academic-100 text-academic-700 text-xs font-semibold shrink-0">
                    4
                  </span>
                  在"提交数据集"页面分享您的研究数据，推动学术开放。
                </li>
              ) : null}
            </ul>
            <p className="text-xs text-academic-500 mt-5 pt-5 border-t border-academic-100">
              提示：当前共 {getApprovedDatasets().length} 个公开数据集可供使用。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
