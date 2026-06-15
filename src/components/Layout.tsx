import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Database, Search, Bell, User, LogOut, Plus, ShieldCheck, Heart, FileText } from 'lucide-react';
import { useStore } from '../store';
import { RoleBadge } from './Badges';

export function Navbar() {
  const { currentUser, logout, getUnreadCount, getPendingDatasets } = useStore();
  const navigate = useNavigate();
  const unread = currentUser ? getUnreadCount(currentUser.id) : 0;
  const pendingCount = getPendingDatasets().length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-academic-100 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-academic-700 to-academic-900 flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow">
              <Database className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-lg font-semibold text-academic-900 tracking-tight">
                DataCite Hub
              </div>
              <div className="text-[10px] text-academic-500 uppercase tracking-widest">
                Research Dataset Catalog
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-academic-900 bg-academic-50'
                    : 'text-academic-600 hover:text-academic-900 hover:bg-academic-50'
                }`
              }
            >
              首页
            </NavLink>
            <NavLink
              to="/datasets"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-academic-900 bg-academic-50'
                    : 'text-academic-600 hover:text-academic-900 hover:bg-academic-50'
                }`
              }
            >
              数据集
            </NavLink>
            {(currentUser?.role === 'researcher' || currentUser?.role === 'admin') && (
              <NavLink
                to="/submit"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                    isActive
                      ? 'text-academic-900 bg-academic-50'
                      : 'text-academic-600 hover:text-academic-900 hover:bg-academic-50'
                  }`
                }
              >
                <Plus className="w-4 h-4" />
                提交数据集
              </NavLink>
            )}
            {currentUser?.role === 'admin' && (
              <NavLink
                to="/admin/review"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5 relative ${
                    isActive
                      ? 'text-academic-900 bg-academic-50'
                      : 'text-academic-600 hover:text-academic-900 hover:bg-academic-50'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                审核管理
                {pendingCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-warning-500 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/datasets"
              className="btn-ghost !p-2"
              aria-label="搜索"
            >
              <Search className="w-5 h-5" />
            </Link>
            {currentUser && (
              <Link
                to="/user/notifications"
                className="btn-ghost !p-2 relative"
                aria-label="通知"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-danger-500 rounded-full animate-pulse-slow">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/user/profile"
                  className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-academic-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-academic-600 to-academic-800 flex items-center justify-center text-white text-sm font-medium">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-academic-800">
                    {currentUser.name}
                  </span>
                  <RoleBadge role={currentUser.role} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost !p-2"
                  aria-label="退出登录"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost">
                  登录
                </Link>
                <Link to="/register" className="btn-primary">
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function UserSidebar() {
  const { currentUser } = useStore();
  if (!currentUser) return null;

  const items = [
    { to: '/user/profile', icon: User, label: '个人资料' },
    { to: '/user/favorites', icon: Heart, label: '我的收藏' },
    { to: '/user/submissions', icon: FileText, label: '我的提交' },
    { to: '/user/notifications', icon: Bell, label: '消息通知' },
  ];

  return (
    <aside className="card p-4 h-fit w-full lg:w-64 shrink-0">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-academic-100">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-academic-600 to-academic-800 flex items-center justify-center text-white text-lg font-semibold">
          {currentUser.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-academic-900 truncate">{currentUser.name}</div>
          <div className="text-xs text-academic-500 truncate">{currentUser.email}</div>
          <div className="mt-1">
            <RoleBadge role={currentUser.role} />
          </div>
        </div>
      </div>
      <nav className="flex lg:flex-col gap-1 flex-wrap">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex-1 lg:flex-none ${
                isActive
                  ? 'bg-academic-800 text-white shadow-sm'
                  : 'text-academic-700 hover:bg-academic-50 hover:text-academic-900'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function Footer() {
  return (
    <footer className="bg-academic-900 text-academic-100 mt-20">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-semibold">DataCite Hub</span>
            </div>
            <p className="text-sm text-academic-300 leading-relaxed">
              面向科研工作者的数据集引用目录平台，促进数据共享与规范引用。
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-white">平台</h4>
            <ul className="space-y-2 text-sm text-academic-300">
              <li><Link to="/datasets" className="hover:text-white transition-colors">数据集浏览</Link></li>
              <li><Link to="/submit" className="hover:text-white transition-colors">提交数据集</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">关于我们</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-white">资源</h4>
            <ul className="space-y-2 text-sm text-academic-300">
              <li>引用规范</li>
              <li>数据许可说明</li>
              <li>开发者文档</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 text-white">联系</h4>
            <ul className="space-y-2 text-sm text-academic-300">
              <li>support@datacite.edu</li>
              <li>学术合作合作</li>
              <li>意见反馈</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-academic-400 flex flex-col md:flex-row md:justify-between gap-2">
          <div>© {new Date().getFullYear()} DataCite Hub. 保留所有权利。</div>
          <div>服务条款 · 隐私政策 · 数据使用规范</div>
        </div>
      </div>
    </footer>
  );
}
