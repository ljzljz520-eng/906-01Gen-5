import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="container py-24 animate-fade-in">
      <div className="max-w-lg mx-auto text-center">
        <div className="font-serif text-[96px] font-bold leading-none text-academic-800/10 mb-2">
          404
        </div>
        <h1 className="font-serif text-3xl font-semibold text-academic-900 mb-3">
          页面未找到
        </h1>
        <p className="text-academic-600 mb-8">
          您访问的页面不存在，或数据集已被移除。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" /> 返回首页
          </Link>
          <Link to="/datasets" className="btn-outline">
            <ArrowLeft className="w-4 h-4" /> 数据集列表
          </Link>
        </div>
      </div>
    </div>
  );
}
