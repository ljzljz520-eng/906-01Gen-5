import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Database, Mail, Lock, User as UserIcon, Building2, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { RoleBadge } from '../components/Badges';
import type { UserRole } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(email.trim(), password);
    if (!user) {
      setError('邮箱或密码错误');
      return;
    }
    navigate(from, { replace: true });
  };

  const demoAccounts = [
    { email: 'admin@datacite.edu', password: 'admin123', role: 'admin' },
    { email: 'researcher@datacite.edu', password: 'research123', role: 'researcher' },
    { email: 'user@datacite.edu', password: 'user123', role: 'user' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-academic-700 to-academic-900 flex items-center justify-center text-white mb-4 shadow-md">
            <Database className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-academic-900 mb-1">
            登录 DataCite Hub
          </h1>
          <p className="text-sm text-academic-500">使用您的账户登录以访问完整功能</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700">
              {error}
            </div>
          )}
          <div>
            <label className="label">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input !pl-9"
                placeholder="you@example.edu"
              />
            </div>
          </div>
          <div>
            <label className="label">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input !pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            登录
          </button>
          <div className="text-center text-sm text-academic-500">
            还没有账号？
            <Link to="/register" className="text-academic-800 font-medium hover:underline ml-1">
              立即注册
            </Link>
          </div>
        </form>

        <div className="mt-6 card p-4">
          <div className="text-xs font-semibold text-academic-500 uppercase tracking-wider mb-2.5">
            演示账号（快速体验）
          </div>
          <div className="space-y-1.5">
            {demoAccounts.map((a) => (
              <div
                key={a.email}
                className="flex items-center justify-between text-xs bg-academic-50 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-academic-700">{a.email}</span>
                  <RoleBadge role={a.role as UserRole} />
                </div>
                <button
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.password);
                  }}
                  className="text-academic-700 hover:text-academic-900 font-medium"
                >
                  填入
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要 6 位');
      return;
    }
    register({ name, email, organization: organization || undefined, role, password });
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-academic-700 to-academic-900 flex items-center justify-center text-white mb-4 shadow-md">
            <Database className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-academic-900 mb-1">
            创建账号
          </h1>
          <p className="text-sm text-academic-500">加入 DataCite Hub，开启您的科研数据之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700">
              {error}
            </div>
          )}
          <div>
            <label className="label">姓名</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input !pl-9"
                placeholder="您的姓名"
              />
            </div>
          </div>
          <div>
            <label className="label">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input !pl-9"
                placeholder="you@example.edu"
              />
            </div>
          </div>
          <div>
            <label className="label">所属机构</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="input !pl-9"
                placeholder="例如：清华大学（选填）"
              />
            </div>
          </div>
          <div>
            <label className="label">账号角色</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'user', label: '普通用户' },
                { v: 'researcher', label: '研究人员' },
              ].map((r) => (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setRole(r.v as UserRole)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium border transition-all ${
                    role === r.v
                      ? 'border-academic-700 bg-academic-50 text-academic-900'
                      : 'border-academic-200 bg-white text-academic-600 hover:border-academic-400'
                  }`}
                >
                  {r.v === 'researcher' ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input !pl-9"
                  placeholder="至少 6 位"
                />
              </div>
            </div>
            <div>
              <label className="label">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-academic-400" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="input !pl-9"
                  placeholder="再次输入"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            创建账号
          </button>
          <div className="text-center text-sm text-academic-500">
            已有账号？
            <Link to="/login" className="text-academic-800 font-medium hover:underline ml-1">
              去登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
