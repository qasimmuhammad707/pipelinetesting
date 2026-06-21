export const initials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const STATUSES = [
  { key: 'todo', label: 'To Do', color: '#6b7280' },
  { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { key: 'in_review', label: 'In Review', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#10b981' },
];

export const PRIORITIES = [
  { key: 'low', label: 'Low', color: '#6b7280' },
  { key: 'medium', label: 'Medium', color: '#3b82f6' },
  { key: 'high', label: 'High', color: '#f59e0b' },
  { key: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export const statusMeta = (key) => STATUSES.find((s) => s.key === key) || STATUSES[0];
export const priorityMeta = (key) => PRIORITIES.find((p) => p.key === key) || PRIORITIES[1];
