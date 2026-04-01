import type { PrescriptionFollowUpStatus } from '@/types/prescription';

type FollowUpMeta = {
  label: string;
  badge: 'default' | 'warning' | 'info' | 'success';
};

const FOLLOW_UP_META: Record<PrescriptionFollowUpStatus, FollowUpMeta> = {
  needs_review: {
    label: 'Cần kiểm tra',
    badge: 'warning',
  },
  needs_customer_contact: {
    label: 'Cần liên hệ khách',
    badge: 'info',
  },
  waiting_customer_response: {
    label: 'Chờ khách phản hồi',
    badge: 'default',
  },
  customer_responded: {
    label: 'Khách đã phản hồi',
    badge: 'success',
  },
};

export function getPrescriptionFollowUpMeta(
  status: PrescriptionFollowUpStatus
): FollowUpMeta {
  return FOLLOW_UP_META[status];
}

export function getPrescriptionFollowUpLabel(
  status: PrescriptionFollowUpStatus
): string {
  return getPrescriptionFollowUpMeta(status).label;
}
