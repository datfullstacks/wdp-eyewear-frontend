'use client';

import { useTranslations } from 'next-intl';
import { ManagerLayoutNew } from '@/components/templates/ManagerLayoutNew';
import { StatCardNew } from '@/components/molecules/StatCardNew';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Download,
  Filter,
} from 'lucide-react';

export default function ManagerRevenuePage() {
  const t = useTranslations('manager.revenue');

  const stats = [
    {
      title: t('stats.totalRevenue'),
      value: '$124,500',
      icon: <DollarSign className="h-5 w-5" />,
      trend: { value: 12.5, isPositive: true },
      description: 'Total revenue this month',
    },
    {
      title: t('stats.totalOrders'),
      value: '1,234',
      icon: <ShoppingCart className="h-5 w-5" />,
      trend: { value: 8.3, isPositive: true },
      description: 'Orders processed',
    },
    {
      title: t('stats.avgOrderValue'),
      value: '$98.50',
      icon: <TrendingUp className="h-5 w-5" />,
      trend: { value: 3.2, isPositive: false },
      description: 'Average per order',
    },
    {
      title: t('stats.totalCustomers'),
      value: '856',
      icon: <Users className="h-5 w-5" />,
      trend: { value: 15.7, isPositive: true },
      description: 'Active customers',
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      product: 'Ray-Ban Classic',
      amount: '$125.00',
      status: 'completed',
      date: '2026-01-30',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      product: 'Oakley Sport',
      amount: '$198.00',
      status: 'processing',
      date: '2026-01-30',
    },
    {
      id: 'ORD-003',
      customer: 'Bob Johnson',
      product: 'Persol Vintage',
      amount: '$245.00',
      status: 'completed',
      date: '2026-01-29',
    },
    {
      id: 'ORD-004',
      customer: 'Alice Brown',
      product: 'Gucci Designer',
      amount: '$350.00',
      status: 'pending',
      date: '2026-01-29',
    },
  ];

  return (
    <ManagerLayoutNew>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCardNew key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentOrders')}</CardTitle>
          <CardDescription>
            Recent transactions from your eyewear store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === 'completed'
                          ? 'default'
                          : order.status === 'processing'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="text-right">{order.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ManagerLayoutNew>
  );
}
