import type {
  SaleCartItem,
  SaleCheckoutItemPayload,
  SaleCheckoutPayload,
  SaleProduct,
  SaleProductOption,
  SaleProductVariant,
  ShippingAddressForm,
} from '@/types/saleCheckout';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600';

function sanitizeNumber(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

function getPrimaryImage(product: SaleProduct): string {
  if (product.imageUrl) return product.imageUrl;

  const assets = product.media?.assets || [];
  const hero = assets.find((asset) => asset?.role === 'hero')?.url;
  return hero || assets[0]?.url || FALLBACK_IMAGE;
}

export function mapProductToOption(product: SaleProduct): SaleProductOption {
  return {
    id: product._id,
    label: product.name,
    description: [product.brand, product.type].filter(Boolean).join(' • '),
    imageUrl: getPrimaryImage(product),
  };
}

export function buildCheckoutItem(
  cartItem: SaleCartItem,
  quantity?: number
): SaleCheckoutItemPayload {
  const normalizedQuantity = sanitizeNumber(quantity ?? cartItem.quantity);

  return {
    productId: cartItem.productId,
    product_id: cartItem.productId,
    variantId: cartItem.variantId,
    variant_id: cartItem.variantId,
    quantity: normalizedQuantity,
  };
}

export function mapProductToCartItem(
  product: SaleProduct,
  variant: SaleProductVariant,
  quantity: number
): SaleCartItem {
  const normalizedQuantity = sanitizeNumber(quantity);
  const fallbackPrice = Number(
    product.pricing?.salePrice ?? product.pricing?.basePrice ?? 0
  );

  return {
    productId: product._id,
    variantId: variant._id,
    productName: product.name,
    productType: product.type || '',
    brand: product.brand || '',
    image: getPrimaryImage(product),
    variantOptions: {
      color: variant.options?.color || '',
      size: variant.options?.size || '',
    },
    price: Number(variant.price ?? fallbackPrice),
    stock: Number(variant.stock || 0),
    quantity: normalizedQuantity,
  };
}

export function buildCheckoutPayload(input: {
  cartItems: SaleCartItem[];
  shippingAddress: ShippingAddressForm;
  note?: string;
}): SaleCheckoutPayload {
  const { cartItems, shippingAddress, note } = input;

  return {
    items: cartItems.map((item) => buildCheckoutItem(item, item.quantity)),
    shippingFee: 25000,
    discountAmount: 0,
    shippingMethod: 'standard',
    shippingAddress,
    note: note || '',
  };
}
