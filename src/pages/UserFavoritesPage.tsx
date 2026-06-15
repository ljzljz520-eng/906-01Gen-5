import { Navigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { useStore } from '../store';
import { UserSidebar } from '../components/Layout';
import { DatasetCard } from '../components/DatasetCard';

export function UserFavoritesPage() {
  const { currentUser, getUserFavorites } = useStore();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/user/favorites' }} replace />;
  }

  const favorites = getUserFavorites(currentUser.id);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <UserSidebar />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-academic-900 mb-1 flex items-center gap-2">
                <Heart className="w-6 h-6 text-danger-500" />
                我的收藏
              </h1>
              <p className="text-sm text-academic-500">
                共收藏 {favorites.length} 个数据集，修订或撤稿时将通知您
              </p>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="card p-12 text-center">
              <Search className="w-12 h-12 text-academic-300 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-semibold text-academic-800 mb-1">
                还没有收藏任何数据集
              </h3>
              <p className="text-sm text-academic-500 mb-4">
                浏览数据集目录，收藏感兴趣的数据集以便后续查阅
              </p>
              <a href="/datasets" className="btn-primary">
                浏览数据集
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {favorites.map((d) => (
                <DatasetCard key={d.id} dataset={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
