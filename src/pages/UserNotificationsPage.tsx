import { Navigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  FileX2,
  TrendingUp,
  ShieldCheck,
  Megaphone,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { useStore } from '../store';
import { UserSidebar } from '../components/Layout';
import { NotificationBadge } from '../components/Badges';
import type { Notification } from '../types';

const notifIcons: Record<Notification['type'], typeof Bell> = {
  dataset_retracted: FileX2,
  dataset_updated: TrendingUp,
  review_result: ShieldCheck,
  system: Megaphone,
};

const notifAccent: Record<Notification['type'], string> = {
  dataset_retracted: 'bg-danger-500',
  dataset_updated: 'bg-success-500',
  review_result: 'bg-academic-500',
  system: 'bg-warning-500',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return d.toLocaleDateString('zh-CN');
}

export function UserNotificationsPage() {
  const { currentUser, getUserNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } =
    useStore();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/user/notifications' }} replace />;
  }

  const notifications = getUserNotifications(currentUser.id);
  const unread = getUnreadCount(currentUser.id);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        <UserSidebar />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-academic-900 mb-1 flex items-center gap-2">
                <Bell className="w-6 h-6 text-academic-700" />
                消息通知
              </h1>
              <p className="text-sm text-academic-500">
                {unread > 0 ? `您有 ${unread} 条未读消息` : '所有消息均已阅读'}
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={() => markAllNotificationsRead(currentUser.id)}
                className="btn-outline !py-2 text-sm"
              >
                <CheckCheck className="w-4 h-4" /> 全部标为已读
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="card p-12 text-center">
              <Inbox className="w-12 h-12 text-academic-300 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-semibold text-academic-800 mb-1">
                暂时没有消息
              </h3>
              <p className="text-sm text-academic-500">
                系统会通知您收藏数据集的变动和审核结果
              </p>
            </div>
          ) : (
            <div className="card divide-y divide-academic-100 overflow-hidden">
              {notifications.map((n) => {
                const Icon = notifIcons[n.type];
                return (
                  <Link
                    key={n.id}
                    to={n.datasetId ? `/datasets/${n.datasetId}` : '#'}
                    onClick={() => {
                      if (!n.isRead) markNotificationRead(n.id);
                    }}
                    className={`flex items-start gap-4 p-5 hover:bg-academic-50/60 transition-colors relative ${
                      !n.isRead ? 'bg-academic-50/30' : ''
                    }`}
                  >
                    {!n.isRead && (
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-1 ${notifAccent[n.type]}`}
                      />
                    )}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === 'dataset_retracted'
                          ? 'bg-danger-50 text-danger-600'
                          : n.type === 'dataset_updated'
                          ? 'bg-success-50 text-success-700'
                          : n.type === 'system'
                          ? 'bg-warning-50 text-warning-700'
                          : 'bg-academic-50 text-academic-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-medium text-academic-900 text-sm">{n.title}</h4>
                        <NotificationBadge type={n.type} />
                        {!n.isRead && (
                          <span className="inline-block w-2 h-2 rounded-full bg-danger-500" />
                        )}
                      </div>
                      <p className="text-sm text-academic-600 leading-relaxed">{n.content}</p>
                      <div className="text-xs text-academic-400 mt-1.5">{formatDate(n.createdAt)}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-academic-400 shrink-0 mt-1 hidden sm:block" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
