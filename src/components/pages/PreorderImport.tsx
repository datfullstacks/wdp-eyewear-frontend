'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';
import { preorderApi, productApi, userApi } from '@/api';
import type {
  CreatePreorderBatchInput,
  Product,
  ProductDetail,
} from '@/api';
import { extractSuppliers, calculateStats } from '@/data/preorderImportData';
import {
  ImportStatsGrid,
  ImportBatchTable,
  ImportDetailModal,
  ImportReceiveModal,
  ImportCreateModal,
} from '@/components/organisms/preorder-import';
import type {
  ImportDraftItem,
  ImportProductOption,
} from '@/components/organisms/preorder-import';
import type { PreorderBatch } from '@/types/preorderImport';

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function createBatchCode() {
  const stamp = toDateInputValue(new Date()).replace(/-/g, '');
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `PO-${stamp}-${suffix}`;
}

function createEmptyDraftItem(): ImportDraftItem {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: '',
    variantId: '',
    orderedQty: 1,
  };
}

function createInitialDraft() {
  const today = new Date();
  return {
    batchCode: createBatchCode(),
    supplier: '',
    orderDate: toDateInputValue(today),
    expectedDate: toDateInputValue(addDays(today, 14)),
    note: '',
    items: [createEmptyDraftItem()],
  };
}

type ProductVariant = NonNullable<ProductDetail['variants']>[number];

function buildVariantLabel(variant: ProductVariant) {
  const options = Object.values(variant?.options || {})
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  if (options.length > 0) return options.join(' / ');
  if (variant?.sku) return variant.sku;
  return 'Mac dinh';
}

function getErrorMessage(error: unknown, fallback: string) {
  const responseMessage =
    (error as any)?.response?.data?.message ||
    (error as any)?.response?.data?.error ||
    (error as any)?.message;
  return typeof responseMessage === 'string' && responseMessage.trim()
    ? responseMessage
    : fallback;
}

function buildInitialReceiveQuantities(batch: PreorderBatch | null) {
  const next: Record<string, number> = {};
  if (!batch) return next;

  batch.items.forEach((item) => {
    if (item.pendingQty > 0) {
      next[item.id] = 0;
    }
  });

  return next;
}

const PreorderImport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [selectedBatch, setSelectedBatch] = useState<PreorderBatch | null>(
    null
  );
  const [batches, setBatches] = useState<PreorderBatch[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetailsById, setProductDetailsById] = useState<
    Record<string, ProductDetail>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [receiveQuantities, setReceiveQuantities] = useState<
    Record<string, number>
  >({});
  const [receiveNotes, setReceiveNotes] = useState('');
  const [receiveError, setReceiveError] = useState('');
  const [isSubmittingReceive, setIsSubmittingReceive] = useState(false);
  const [createDraft, setCreateDraft] = useState(createInitialDraft);
  const [createError, setCreateError] = useState('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [resolvedStoreId, setResolvedStoreId] = useState('');
  const [resolvedStoreLabel, setResolvedStoreLabel] = useState('');
  const [storeScopeError, setStoreScopeError] = useState('');
  const [isResolvingStoreScope, setIsResolvingStoreScope] = useState(true);

  const productOptions = useMemo<ImportProductOption[]>(
    () =>
      [...products]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((product) => {
          const detail = productDetailsById[product.id];
          return {
            id: product.id,
            name: product.name,
            brand: product.brand,
            variants:
              detail?.variants
                ?.filter((variant) => String(variant?._id || '').trim())
                .map((variant) => ({
                  id: String(variant?._id || ''),
                  label: buildVariantLabel(variant),
                  sku: String(variant?.sku || ''),
                  stock: Number(variant?.stock || 0),
                })) || [],
          };
        }),
    [productDetailsById, products]
  );

  const suppliers = useMemo(() => extractSuppliers(batches), [batches]);
  const stats = useMemo(() => calculateStats(batches), [batches]);

  const upsertBatch = (updatedBatch: PreorderBatch) => {
    setBatches((current) => {
      const exists = current.some((batch) => batch.id === updatedBatch.id);
      if (!exists) return [updatedBatch, ...current];
      return current.map((batch) =>
        batch.id === updatedBatch.id ? updatedBatch : batch
      );
    });
  };

  const ensureProductDetail = async (productId: string) => {
    if (!productId) return null;
    if (productDetailsById[productId]) return productDetailsById[productId];

    const detail = await productApi.getById(productId);
    setProductDetailsById((current) => ({
      ...current,
      [productId]: detail,
    }));
    return detail;
  };

  const loadPageData = async (page = currentPage) => {
    setIsLoading(true);
    setPageError('');
    try {
      const [batchResult, productResult] = await Promise.all([
        preorderApi.listBatches({
          page,
          limit: pageSize,
          status:
            statusFilter === 'all'
              ? 'all'
              : (statusFilter as PreorderBatch['status']),
          supplier: supplierFilter === 'all' ? undefined : supplierFilter,
          search: searchTerm.trim() || undefined,
        }),
        productApi.getAll({ page: 1, limit: 100 }),
      ]);
      setBatches(batchResult.batches);
      setProducts(productResult.products);
      setPagination(batchResult.pagination);
    } catch (error) {
      setPageError(
        getErrorMessage(error, 'Khong the tai du lieu nhap hang pre-order.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadBatchDetail = async (batchId: string) => {
    try {
      const batch = await preorderApi.getBatchById(batchId);
      setSelectedBatch(batch);
      upsertBatch(batch);
      return batch;
    } catch (error) {
      setPageError(
        getErrorMessage(error, 'Khong the tai chi tiet batch pre-order.')
      );
      return null;
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, supplierFilter, pageSize]);

  useEffect(() => {
    let mounted = true;

    const loadStoreScope = async () => {
      setIsResolvingStoreScope(true);
      setStoreScopeError('');

      try {
        const session = await getSession();
        const currentUserId = String(session?.user?.id || '').trim();
        if (!currentUserId) {
          throw new Error('Khong xac dinh duoc tai khoan dang nhap.');
        }

        const currentUser = await userApi.getById(currentUserId);
        const scope = currentUser.storeAccess;
        const nextStoreId =
          scope?.primaryStoreId || scope?.storeIds?.[0] || '';

        if (!nextStoreId) {
          throw new Error(
            'Tai khoan operation chua duoc gan cua hang de tao dot nhap kho.'
          );
        }

        const nextStoreLabel =
          scope?.primaryStore?.name ||
          scope?.stores.find((store) => store.id === nextStoreId)?.name ||
          '';

        if (!mounted) return;
        setResolvedStoreId(nextStoreId);
        setResolvedStoreLabel(nextStoreLabel);
      } catch (error) {
        if (!mounted) return;
        setResolvedStoreId('');
        setResolvedStoreLabel('');
        setStoreScopeError(
          getErrorMessage(
            error,
            'Khong tai duoc pham vi cua hang cua tai khoan operation.'
          )
        );
      } finally {
        if (mounted) {
          setIsResolvingStoreScope(false);
        }
      }
    };

    void loadStoreScope();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    loadPageData(currentPage);
  }, [currentPage, searchTerm, statusFilter, supplierFilter, pageSize]);

  const handleOpenDetail = async (batch: PreorderBatch) => {
    setSelectedBatch(batch);
    setIsDetailOpen(true);
    await loadBatchDetail(batch.id);
  };

  const handleOpenReceive = async (batch: PreorderBatch) => {
    setSelectedBatch(batch);
    setReceiveQuantities(buildInitialReceiveQuantities(batch));
    setReceiveNotes('');
    setReceiveError('');
    setIsReceiveOpen(true);

    const freshBatch = await loadBatchDetail(batch.id);
    if (freshBatch) {
      setReceiveQuantities(buildInitialReceiveQuantities(freshBatch));
    }
  };

  const handleConfirmReceive = async () => {
    if (!selectedBatch) return;

    const payloadItems = Object.entries(receiveQuantities)
      .map(([batchItemId, quantity]) => ({
        batchItemId,
        quantity: Number(quantity || 0),
      }))
      .filter((item) => item.quantity > 0);

    if (payloadItems.length === 0) {
      setReceiveError('Can chon it nhat mot san pham de nhap kho.');
      return;
    }

    setIsSubmittingReceive(true);
    setReceiveError('');
    try {
      const updatedBatch = await preorderApi.receiveBatch(selectedBatch.id, {
        note: receiveNotes.trim() || undefined,
        items: payloadItems,
      });
      upsertBatch(updatedBatch);
      setSelectedBatch(updatedBatch);
      setIsReceiveOpen(false);
      loadPageData(currentPage);
    } catch (error) {
      setReceiveError(
        getErrorMessage(error, 'Khong the xac nhan nhap kho cho batch nay.')
      );
    } finally {
      setIsSubmittingReceive(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateDraft(createInitialDraft());
    setCreateError('');
    setIsCreateOpen(true);
  };

  const handleDraftFieldChange = (
    field: 'batchCode' | 'supplier' | 'orderDate' | 'expectedDate' | 'note',
    value: string
  ) => {
    setCreateError('');
    setCreateDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleDraftItemChange = async (
    itemKey: string,
    field: 'productId' | 'variantId' | 'orderedQty',
    value: string | number
  ) => {
    setCreateError('');

    if (field === 'orderedQty') {
      setCreateDraft((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.key === itemKey
            ? {
                ...item,
                orderedQty: Math.max(1, Number(value || 1)),
              }
            : item
        ),
      }));
      return;
    }

    if (field === 'productId') {
      const productId = String(value || '');
      setCreateDraft((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.key === itemKey
            ? { ...item, productId, variantId: '' }
            : item
        ),
      }));

      if (!productId) return;

      try {
        const detail = await ensureProductDetail(productId);
        const variants = detail?.variants || [];
        if (variants.length === 1) {
          setCreateDraft((current) => ({
            ...current,
            items: current.items.map((item) =>
              item.key === itemKey
                ? {
                    ...item,
                    productId,
                    variantId: String(variants[0]?._id || ''),
                  }
                : item
            ),
          }));
        }
      } catch (error) {
        setCreateError(
          getErrorMessage(error, 'Khong the tai danh sach bien the cho san pham.')
        );
      }
      return;
    }

    setCreateDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.key === itemKey
          ? { ...item, variantId: String(value || '') }
          : item
      ),
    }));
  };

  const handleCreateBatch = async () => {
    const supplier = createDraft.supplier.trim();
    const batchCode = createDraft.batchCode.trim().toUpperCase();

    if (!resolvedStoreId) {
      setCreateError(
        storeScopeError || 'Tai khoan operation chua duoc gan cua hang de tao dot nhap.'
      );
      return;
    }

    if (!batchCode) {
      setCreateError('Batch code la bat buoc.');
      return;
    }

    if (!supplier) {
      setCreateError('Nha cung cap la bat buoc.');
      return;
    }

    if (!createDraft.orderDate) {
      setCreateError('Ngay dat hang la bat buoc.');
      return;
    }

    const incompleteItem = createDraft.items.find(
      (item) => !item.productId || !item.variantId || item.orderedQty < 1
    );
    if (incompleteItem) {
      setCreateError('Hay chon du san pham, bien the va so luong cho moi dong.');
      return;
    }

    setIsSubmittingCreate(true);
    setCreateError('');

    try {
      const items: CreatePreorderBatchInput['items'] = await Promise.all(
        createDraft.items.map(async (item) => {
          const detail = await ensureProductDetail(item.productId);
          const variant = detail?.variants?.find(
            (variantOption) =>
              String(variantOption?._id || '') === item.variantId
          );

          if (!detail || !variant || !variant._id) {
            throw new Error('Khong tim thay bien the hop le cho mot dong san pham.');
          }

          return {
            productId: item.productId,
            variantId: String(variant._id),
            orderedQty: item.orderedQty,
            sku: String(variant.sku || ''),
            variantLabel: buildVariantLabel(variant),
          };
        })
      );

      const createdBatch = await preorderApi.createBatch({
        batchCode,
        storeId: resolvedStoreId,
        supplier,
        orderDate: createDraft.orderDate,
        expectedDate: createDraft.expectedDate || undefined,
        note: createDraft.note.trim() || undefined,
        items,
      });

      upsertBatch(createdBatch);
      setSelectedBatch(createdBatch);
      setIsCreateOpen(false);
      setCreateDraft(createInitialDraft());
      setCurrentPage(1);
      loadPageData(1);
    } catch (error) {
      setCreateError(
        getErrorMessage(error, 'Khong the tao dot hang pre-order moi.')
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  return (
    <>
      <Header
        title="Nhap hang Pre-order"
        subtitle={
          resolvedStoreLabel
            ? `Operation quan ly batch nhap kho cho ${resolvedStoreLabel}`
            : 'Operation quan ly batch nhap kho va cap nhat hang pre-order ve kho'
        }
      />
      <div className="space-y-6 p-6">
        <ImportStatsGrid stats={stats} />

        {storeScopeError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {storeScopeError}
          </div>
        ) : resolvedStoreId ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Dot nhap hang moi se duoc tao cho{' '}
            <span className="font-semibold">
              {resolvedStoreLabel || 'cua hang duoc phan quyen'}
            </span>
            .
          </div>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="w-full sm:max-w-[240px]">
              <SearchBar
                placeholder="Tim theo ma dot, nha cung cap..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div className="flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Bo loc"
                    className="text-foreground/80 hover:text-foreground"
                  >
                    <Filter />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Trang thai</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tat ca trang thai
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="pending">
                      Dang xu ly
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="in_transit">
                      Dang van chuyen
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="partial">
                      Nhan mot phan
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="completed">
                      Hoan thanh
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="delayed">
                      Tre hang
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Nha cung cap</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={supplierFilter}
                    onValueChange={setSupplierFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tat ca nha cung cap
                    </DropdownMenuRadioItem>
                    {suppliers.map((supplier) => (
                      <DropdownMenuRadioItem key={supplier} value={supplier}>
                        {supplier}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenCreate}
              className="gap-2"
              disabled={isResolvingStoreScope || !resolvedStoreId}
            >
              <Plus className="h-4 w-4" />
              {isResolvingStoreScope ? 'Dang tai cua hang...' : 'Tao dot hang moi'}
            </Button>
          </div>
        </div>

        {pageError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {pageError}
          </div>
        ) : null}

        {isLoading ? (
          <div className="text-muted-foreground rounded-xl border bg-white px-4 py-10 text-center text-sm">
            Dang tai du lieu nhap hang...
          </div>
        ) : (
          <ImportBatchTable
            batches={batches}
            onViewDetail={handleOpenDetail}
            onReceive={handleOpenReceive}
          />
        )}

        {pagination.totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-700">
            <p>
              Trang <span className="font-semibold">{pagination.page}</span>/
              {pagination.totalPages}{' '}
              <span className="text-slate-500">
                ({pagination.total} dot hang)
              </span>
            </p>

                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) =>
                      setPageSize(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="20 / trang" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option} / trang
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={pagination.page <= 1 || isLoading}
              >
                Trang truoc
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(pagination.totalPages, page + 1)
                  )
                }
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                Trang sau
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <ImportDetailModal
        batch={selectedBatch}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onReceive={handleOpenReceive}
      />

      <ImportReceiveModal
        batch={selectedBatch}
        open={isReceiveOpen}
        onOpenChange={setIsReceiveOpen}
        receiveQuantities={receiveQuantities}
        onReceiveQuantitiesChange={setReceiveQuantities}
        receiveNotes={receiveNotes}
        onReceiveNotesChange={setReceiveNotes}
        onConfirm={handleConfirmReceive}
        isSubmitting={isSubmittingReceive}
        errorMessage={receiveError}
      />

      <ImportCreateModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        draft={createDraft}
        products={productOptions}
        isSubmitting={isSubmittingCreate}
        errorMessage={createError}
        onFieldChange={handleDraftFieldChange}
        onItemChange={handleDraftItemChange}
        onAddItem={() =>
          setCreateDraft((current) => ({
            ...current,
            items: [...current.items, createEmptyDraftItem()],
          }))
        }
        onRemoveItem={(itemKey) =>
          setCreateDraft((current) => ({
            ...current,
            items:
              current.items.length === 1
                ? current.items
                : current.items.filter((item) => item.key !== itemKey),
          }))
        }
        onConfirm={handleCreateBatch}
      />
    </>
  );
};

export default PreorderImport;
