'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  ReadyStockChecklistKey,
  ReadyStockHoldReason,
  ReadyStockItemOpsState,
  ReadyStockIssueType,
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';

type ReadyStockOpsStoreState = {
  byOrderId: Record<string, ReadyStockOrderOpsState>;
  upsert: (orderId: string, patch: Partial<ReadyStockOrderOpsState>) => void;
  setStatus: (orderId: string, status: ReadyStockOpsStatus) => void;
  setTracking: (orderId: string, carrierId: string, trackingCode: string) => void;
  setAssignee: (orderId: string, assignee: string) => void;
  setHold: (orderId: string, reason: ReadyStockHoldReason, note: string) => void;
  clearHold: (orderId: string) => void;
  setPaymentFailed: (orderId: string, failed: boolean) => void;
  setItemState: (orderId: string, itemKey: string, patch: Partial<ReadyStockItemOpsState>) => void;
  toggleItemPicked: (orderId: string, itemKey: string) => void;
  toggleChecklist: (orderId: string, key: ReadyStockChecklistKey) => void;
  reportIssue: (orderId: string, type: ReadyStockIssueType, note: string) => void;
  clearIssue: (orderId: string) => void;
  reset: (orderId: string) => void;
  resetAll: () => void;
};

const EMPTY_CHECKLIST: ReadyStockOrderOpsState['checklist'] = {
  skuQuantityChecked: false,
  productConditionChecked: false,
  addressChecked: false,
  packageReady: false,
};

function nowIso() {
  return new Date().toISOString();
}

function baseState(): ReadyStockOrderOpsState {
  return {
    opsStatus: 'pending_operations',
    lastUpdatedAt: nowIso(),
    assignee: '',
    salesApprovedAt: '',
    salesApprovedBy: '',
    salesHandoffNote: '',
    internalNote: '',
    holdReason: null,
    holdNote: '',
    paymentFailed: false,
    checklist: { ...EMPTY_CHECKLIST },
    carrierId: '',
    trackingCode: '',
    issueType: null,
    issueNote: '',
    itemStates: {},
  };
}

function holdReasonFromIssue(type: ReadyStockIssueType): ReadyStockHoldReason {
  if (type === 'out_of_stock' || type === 'wrong_sku' || type === 'damaged_item') return 'stock';
  if (type === 'address_issue') return 'address';
  if (type === 'shipping_label_error') return 'other';
  return 'other';
}

export const useReadyStockOpsStore = create<ReadyStockOpsStoreState>()(
  persist(
    (set) => ({
      byOrderId: {},
      upsert: (orderId, patch) =>
        set((state) => ({
          byOrderId: {
            ...state.byOrderId,
            [orderId]: {
              ...(state.byOrderId[orderId] || baseState()),
              ...patch,
              lastUpdatedAt: nowIso(),
            },
          },
        })),
      setStatus: (orderId, status) =>
        set((state) => ({
          byOrderId: {
            ...state.byOrderId,
            [orderId]: {
              ...(state.byOrderId[orderId] || baseState()),
              opsStatus: status,
              lastUpdatedAt: nowIso(),
            },
          },
        })),
      setTracking: (orderId, carrierId, trackingCode) =>
        set((state) => ({
          byOrderId: {
            ...state.byOrderId,
            [orderId]: {
              ...(state.byOrderId[orderId] || baseState()),
              carrierId,
              trackingCode,
              lastUpdatedAt: nowIso(),
            },
          },
        })),
      setAssignee: (orderId, assignee) =>
        set((state) => ({
          byOrderId: {
            ...state.byOrderId,
            [orderId]: {
              ...(state.byOrderId[orderId] || baseState()),
              assignee,
              lastUpdatedAt: nowIso(),
            },
          },
        })),
      setHold: (orderId, reason, note) =>
        set((state) => ({
          byOrderId: {
            ...state.byOrderId,
            [orderId]: {
              ...(state.byOrderId[orderId] || baseState()),
              opsStatus: 'blocked',
              holdReason: reason,
              holdNote: note,
              lastUpdatedAt: nowIso(),
            },
          },
        })),
      clearHold: (orderId) =>
        set((state) => {
          const current = state.byOrderId[orderId];
          if (!current) return state;
          return {
            byOrderId: {
              ...state.byOrderId,
              [orderId]: {
                ...current,
                opsStatus: current.opsStatus === 'blocked' ? 'pending_operations' : current.opsStatus,
                holdReason: null,
                holdNote: '',
                lastUpdatedAt: nowIso(),
              },
            },
          };
        }),
      setPaymentFailed: (orderId, failed) =>
        set((state) => ({
          byOrderId: {
            ...state.byOrderId,
            [orderId]: {
              ...(state.byOrderId[orderId] || baseState()),
              paymentFailed: failed,
              lastUpdatedAt: nowIso(),
            },
          },
        })),
      setItemState: (orderId, itemKey, patch) =>
        set((state) => {
          const current = state.byOrderId[orderId] || baseState();
          const existing = current.itemStates[itemKey] || {
            picked: false,
            warehouseLocation: '',
            issueType: null,
            issueNote: '',
            internalNote: '',
          };
          return {
            byOrderId: {
              ...state.byOrderId,
              [orderId]: {
                ...current,
                itemStates: {
                  ...current.itemStates,
                  [itemKey]: { ...existing, ...patch },
                },
                lastUpdatedAt: nowIso(),
              },
            },
          };
        }),
      toggleItemPicked: (orderId, itemKey) =>
        set((state) => {
          const current = state.byOrderId[orderId] || baseState();
          const existing = current.itemStates[itemKey];
          if (!existing) return state;
          return {
            byOrderId: {
              ...state.byOrderId,
              [orderId]: {
                ...current,
                itemStates: {
                  ...current.itemStates,
                  [itemKey]: { ...existing, picked: !existing.picked },
                },
                lastUpdatedAt: nowIso(),
              },
            },
          };
        }),
      toggleChecklist: (orderId, key) =>
        set((state) => {
          const current =
            state.byOrderId[orderId] ||
            ({
              ...baseState(),
            } satisfies ReadyStockOrderOpsState);

          return {
            byOrderId: {
              ...state.byOrderId,
              [orderId]: {
                ...current,
                checklist: {
                  ...current.checklist,
                  [key]: !current.checklist[key],
                },
                lastUpdatedAt: nowIso(),
              },
            },
          };
        }),
      reportIssue: (orderId, type, note) =>
        set((state) => ({
          byOrderId: {
            ...state.byOrderId,
            [orderId]: {
              ...(state.byOrderId[orderId] || baseState()),
              opsStatus: 'blocked',
              holdReason: holdReasonFromIssue(type),
              holdNote: note,
              issueType: type,
              issueNote: note,
              lastUpdatedAt: nowIso(),
            },
          },
        })),
      clearIssue: (orderId) =>
        set((state) => {
          const current = state.byOrderId[orderId];
          if (!current) return state;
          return {
            byOrderId: {
              ...state.byOrderId,
              [orderId]: {
                ...current,
                opsStatus:
                  current.opsStatus === 'blocked' ? 'pending_operations' : current.opsStatus,
                holdReason: current.issueType ? null : current.holdReason,
                holdNote: current.issueType ? '' : current.holdNote,
                issueType: null,
                issueNote: '',
                lastUpdatedAt: nowIso(),
              },
            },
          };
        }),
      reset: (orderId) =>
        set((state) => {
          const next = { ...state.byOrderId };
          delete next[orderId];
          return { byOrderId: next };
        }),
      resetAll: () => set({ byOrderId: {} }),
    }),
    { name: 'ready-stock-ops-storage' }
  )
);
