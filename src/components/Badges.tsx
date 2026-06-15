import type { DatasetStatus, NotificationType, UserRole } from '../types';

const statusStyles: Record<DatasetStatus, string> = {
  pending: 'bg-warning-100 text-warning-700 border-warning-200',
  approved: 'bg-success-100 text-success-800 border-success-200',
  rejected: 'bg-danger-100 text-danger-700 border-danger-200',
  retracted: 'bg-academic-100 text-academic-600 border-academic-200',
};

const statusLabels: Record<DatasetStatus, string> = {
  pending: '待审核',
  approved: '已公开',
  rejected: '已驳回',
  retracted: '已撤稿',
};

export function StatusBadge({ status }: { status: DatasetStatus }) {
  return (
    <span className={`badge border ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

const roleStyles: Record<UserRole, string> = {
  visitor: 'bg-academic-100 text-academic-700',
  researcher: 'bg-academic-100 text-academic-800',
  user: 'bg-success-100 text-success-800',
  admin: 'bg-warning-100 text-warning-700',
};

const roleLabels: Record<UserRole, string> = {
  visitor: '访客',
  researcher: '研究人员',
  user: '普通用户',
  admin: '管理员',
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <span className={`badge ${roleStyles[role]}`}>{roleLabels[role]}</span>;
}

const notifStyles: Record<NotificationType, string> = {
  review_result: 'bg-academic-100 text-academic-800',
  dataset_retracted: 'bg-danger-100 text-danger-700',
  dataset_updated: 'bg-success-100 text-success-800',
  system: 'bg-warning-100 text-warning-700',
};

const notifLabels: Record<NotificationType, string> = {
  review_result: '审核结果',
  dataset_retracted: '撤稿通知',
  dataset_updated: '修订通知',
  system: '系统通知',
};

export function NotificationBadge({ type }: { type: NotificationType }) {
  return <span className={`badge ${notifStyles[type]}`}>{notifLabels[type]}</span>;
}

export function LicenseBadge({ license }: { license: string }) {
  let color = 'bg-academic-100 text-academic-700';
  if (license.includes('CC0')) color = 'bg-success-100 text-success-800';
  else if (license.includes('BY-NC')) color = 'bg-warning-100 text-warning-700';
  else if (license.includes('BY')) color = 'bg-academic-100 text-academic-800';
  else if (license.includes('MIT')) color = 'bg-success-100 text-success-700';
  else color = 'bg-academic-50 text-academic-700';
  return <span className={`badge ${color}`}>{license}</span>;
}
