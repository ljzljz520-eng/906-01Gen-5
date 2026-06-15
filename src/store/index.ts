import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Dataset,
  DatasetFilters,
  DatasetStatus,
  Notification,
  User,
} from '../types';
import { mockDatasets, mockNotifications, mockUsers } from '../data/mockData';

interface StoreState {
  datasets: Dataset[];
  currentUser: User | null;
  notifications: Notification[];

  getDatasetById: (id: string) => Dataset | undefined;
  getApprovedDatasets: (filters?: DatasetFilters) => Dataset[];
  getPendingDatasets: () => Dataset[];
  getUserSubmissions: (userId: string) => Dataset[];
  getUserFavorites: (userId: string) => Dataset[];
  getUserNotifications: (userId: string) => Notification[];
  getUnreadCount: (userId: string) => number;

  submitDataset: (data: Dataset) => void;
  reviewDataset: (id: string, decision: 'approve' | 'reject', reason?: string) => Dataset | undefined;
  retractDataset: (id: string, reason: string) => Dataset | undefined;
  reviseDataset: (id: string, changes: string) => Dataset | undefined;
  toggleFavorite: (userId: string, datasetId: string) => boolean;
  recordDownload: (datasetId: string) => void;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  register: (data: Omit<User, 'id' | 'favoriteDatasetIds' | 'password'> & { password: string }) => User;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
}

const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const notifyFavoritingUsers = (
  notifications: Notification[],
  datasets: Dataset[],
  datasetId: string,
  type: 'dataset_retracted' | 'dataset_updated',
  title: string,
  content: string,
): Notification[] => {
  const ds = datasets.find((d) => d.id === datasetId);
  if (!ds) return notifications;
  const notifsToAdd: Notification[] = [];
  mockUsers.forEach((u) => {
    if (u.favoriteDatasetIds.includes(datasetId)) {
      notifsToAdd.push({
        id: createId('notif'),
        userId: u.id,
        type,
        title,
        content,
        datasetId,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  });
  return [...notifsToAdd, ...notifications];
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      datasets: mockDatasets,
      currentUser: null,
      notifications: mockNotifications,

      getDatasetById: (id) => get().datasets.find((d) => d.id === id),

      getApprovedDatasets: (filters) => {
        let list = get().datasets.filter((d) => d.status === 'approved');
        if (!filters) return list;
        const { domain, license, yearFrom, yearTo, sortBy, keyword } = filters;
        if (domain) list = list.filter((d) => d.domain === domain);
        if (license) list = list.filter((d) => d.license === license);
        if (yearFrom)
          list = list.filter((d) => new Date(d.publishedDate).getFullYear() >= yearFrom);
        if (yearTo)
          list = list.filter((d) => new Date(d.publishedDate).getFullYear() <= yearTo);
        if (keyword) {
          const kw = keyword.toLowerCase();
          list = list.filter(
            (d) =>
              d.name.toLowerCase().includes(kw) ||
              d.description.toLowerCase().includes(kw) ||
              d.authors.some((a) => a.toLowerCase().includes(kw)),
          );
        }
        switch (sortBy) {
          case 'newest':
            list.sort(
              (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
            );
            break;
          case 'oldest':
            list.sort(
              (a, b) => new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime(),
            );
            break;
          case 'downloads':
            list.sort((a, b) => b.downloads - a.downloads);
            break;
          case 'favorites':
            list.sort((a, b) => b.favorites - a.favorites);
            break;
          default:
            break;
        }
        return list;
      },

      getPendingDatasets: () => get().datasets.filter((d) => d.status === 'pending'),

      getUserSubmissions: (userId) => get().datasets.filter((d) => d.submittedBy === userId),

      getUserFavorites: (userId) => {
        const currUser = get().currentUser;
        const ids =
          currUser?.id === userId ? currUser.favoriteDatasetIds : [];
        return get().datasets.filter((d) => ids.includes(d.id));
      },

      getUserNotifications: (userId) =>
        get()
          .notifications.filter((n) => n.userId === userId)
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),

      getUnreadCount: (userId) =>
        get().notifications.filter((n) => n.userId === userId && !n.isRead).length,

      submitDataset: (data) => {
        set({ datasets: [...get().datasets, data] });
      },

      reviewDataset: (id, decision, reason) => {
        const ds = get().datasets.find((d) => d.id === id);
        if (!ds) return undefined;
        const newStatus: DatasetStatus = decision === 'approve' ? 'approved' : 'rejected';
        const updated: Dataset = {
          ...ds,
          status: newStatus,
          rejectionReason: decision === 'reject' ? reason : undefined,
          publishedDate:
            decision === 'approve' ? new Date().toISOString().slice(0, 10) : ds.publishedDate,
          revisions:
            decision === 'approve'
              ? [
                  {
                    version: '1.0',
                    date: new Date().toISOString().slice(0, 10),
                    changes: '审核通过，首次公开发布',
                    type: 'update',
                  },
                  ...ds.revisions,
                ]
              : ds.revisions,
        };
        set({ datasets: get().datasets.map((d) => (d.id === id ? updated : d)) });
        set({
          notifications: [
            {
              id: createId('notif'),
              userId: ds.submittedBy,
              type: 'review_result',
              title: decision === 'approve' ? '数据集审核通过' : '数据集审核未通过',
              content:
                decision === 'approve'
                  ? `您提交的 "${ds.name}" 已通过审核，现已在平台公开。`
                  : `您提交的 "${ds.name}" 未通过审核，原因：${reason || '未提供原因'}`,
              datasetId: id,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...get().notifications,
          ],
        });
        return updated;
      },

      retractDataset: (id, reason) => {
        const ds = get().datasets.find((d) => d.id === id);
        if (!ds) return undefined;
        const currVersion = ds.revisions[0]?.version || '1.0';
        const updated: Dataset = {
          ...ds,
          status: 'retracted',
          revisions: [
            {
              version: `${currVersion}-retracted`,
              date: new Date().toISOString().slice(0, 10),
              changes: `撤稿原因：${reason}`,
              type: 'retraction',
            },
            ...ds.revisions,
          ],
        };
        set({ datasets: get().datasets.map((d) => (d.id === id ? updated : d)) });
        set({
          notifications: notifyFavoritingUsers(
            get().notifications,
            get().datasets,
            id,
            'dataset_retracted',
            '数据集撤稿通知',
            `数据集 "${ds.name}" 已被撤稿。原因：${reason}`,
          ),
        });
        return updated;
      },

      reviseDataset: (id, changes) => {
        const ds = get().datasets.find((d) => d.id === id);
        if (!ds) return undefined;
        const currVersion = ds.revisions[0]?.version || '1.0';
        const nextVersion = (parseFloat(currVersion) + 0.1).toFixed(1);
        const updated: Dataset = {
          ...ds,
          revisions: [
            { version: nextVersion, date: new Date().toISOString().slice(0, 10), changes, type: 'update' },
            ...ds.revisions,
          ],
        };
        set({ datasets: get().datasets.map((d) => (d.id === id ? updated : d)) });
        set({
          notifications: notifyFavoritingUsers(
            get().notifications,
            get().datasets,
            id,
            'dataset_updated',
            '数据集修订通知',
            `数据集 "${ds.name}" 已修订：${changes}`,
          ),
        });
        return updated;
      },

      toggleFavorite: (userId, datasetId) => {
        const currUser = get().currentUser;
        if (!currUser || currUser.id !== userId) return false;
        const isFav = currUser.favoriteDatasetIds.includes(datasetId);
        const newFavIds = isFav
          ? currUser.favoriteDatasetIds.filter((id) => id !== datasetId)
          : [...currUser.favoriteDatasetIds, datasetId];
        set({
          currentUser: { ...currUser, favoriteDatasetIds: newFavIds },
          datasets: get().datasets.map((d) =>
            d.id === datasetId ? { ...d, favorites: d.favorites + (isFav ? -1 : 1) } : d,
          ),
        });
        return !isFav;
      },

      recordDownload: (datasetId) => {
        set({
          datasets: get().datasets.map((d) =>
            d.id === datasetId ? { ...d, downloads: d.downloads + 1 } : d,
          ),
        });
      },

      login: (email, password) => {
        const user = mockUsers.find((u) => u.email === email && u.password === password);
        if (!user) return null;
        const { password: _p, ...safeUser } = user;
        const currentUser: User = { ...safeUser, favoriteDatasetIds: user.favoriteDatasetIds };
        set({ currentUser });
        return currentUser;
      },

      logout: () => set({ currentUser: null }),

      register: (data) => {
        const user: User = {
          id: createId('user'),
          email: data.email,
          name: data.name,
          organization: data.organization,
          role: data.role,
          avatar: data.avatar,
          favoriteDatasetIds: [],
        };
        set({ currentUser: user });
        return user;
      },

      markNotificationRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n,
          ),
        });
      },

      markAllNotificationsRead: (userId) => {
        set({
          notifications: get().notifications.map((n) =>
            n.userId === userId ? { ...n, isRead: true } : n,
          ),
        });
      },
    }),
    {
      name: 'datacite-hub-store',
      partialize: (state) => ({
        datasets: state.datasets,
        currentUser: state.currentUser,
        notifications: state.notifications,
      }),
    },
  ),
);
