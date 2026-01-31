import { ProductCard } from '@/components/molecules/ProductCard';

const mockProducts = [
  {
    id: '1',
    name: 'Ray-Ban Aviator Classic',
    brand: 'Ray-Ban',
    price: 4500000,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    category: 'Kính mát',
  },
  {
    id: '2',
    name: 'Oakley Holbrook',
    brand: 'Oakley',
    price: 3800000,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    category: 'Kính mát',
  },
  {
    id: '3',
    name: 'Gucci GG0061S',
    brand: 'Gucci',
    price: 8500000,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    category: 'Kính mát',
  },
  {
    id: '4',
    name: 'Tom Ford FT5401',
    brand: 'Tom Ford',
    price: 7200000,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400',
    category: 'Gọng kính',
  },
  {
    id: '5',
    name: 'Persol PO3019S',
    brand: 'Persol',
    price: 5100000,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400',
    category: 'Kính mát',
  },
  {
    id: '6',
    name: 'Cartier CT0012O',
    brand: 'Cartier',
    price: 12000000,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400',
    category: 'Gọng kính',
  },
];

export const ProductGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {mockProducts.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
};
