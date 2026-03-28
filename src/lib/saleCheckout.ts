import type {
  SaleCartItem,
  SaleCheckoutItemPayload,
  SaleCheckoutPaymentMethod,
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

function capCartQuantity(quantity: number, stock?: number): number {
  const normalizedQuantity = sanitizeNumber(quantity);
  const normalizedStock = Number(stock);

  if (Number.isFinite(normalizedStock) && normalizedStock > 0) {
    return Math.min(normalizedQuantity, Math.floor(normalizedStock));
  }

  return normalizedQuantity;
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

export function reconcileCartItems(
  cartItems: SaleCartItem[],
  products: SaleProduct[]
): {
  items: SaleCartItem[];
  removedItems: SaleCartItem[];
} {
  const productMap = new Map(
    products
      .filter((product) => Boolean(product?._id))
      .map((product) => [String(product._id), product] as const)
  );

  return cartItems.reduce<{
    items: SaleCartItem[];
    removedItems: SaleCartItem[];
  }>(
    (result, cartItem) => {
      const product = productMap.get(String(cartItem.productId));
      if (!product) {
        result.removedItems.push(cartItem);
        return result;
      }

      const variant = product.variants.find(
        (item) => String(item?._id || '') === String(cartItem.variantId)
      );
      if (!variant) {
        result.removedItems.push(cartItem);
        return result;
      }

      result.items.push(
        mapProductToCartItem(
          product,
          variant,
          capCartQuantity(cartItem.quantity, variant.stock)
        )
      );
      return result;
    },
    { items: [], removedItems: [] }
  );
}

export function buildCheckoutPayload(input: {
  cartItems: SaleCartItem[];
  shippingAddress: ShippingAddressForm;
  note?: string;
  paymentMethod?: SaleCheckoutPaymentMethod;
}): SaleCheckoutPayload {
  const { cartItems, shippingAddress, note, paymentMethod } = input;

  return {
    items: cartItems.map((item) => buildCheckoutItem(item, item.quantity)),
    shippingFee: 25000,
    discountAmount: 0,
    shippingMethod: 'standard',
    shippingAddress,
    note: note || '',
    paymentMethod,
  };
}
