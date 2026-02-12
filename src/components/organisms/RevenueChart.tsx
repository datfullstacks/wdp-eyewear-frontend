'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms';

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'Revenue Overview',
}) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const heightPercentage = (item.revenue / maxRevenue) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {item.month}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">{item.orders} orders</span>
                    <span className="font-semibold text-gray-900">
                      ${item.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className="absolute top-0 left-0 h-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${heightPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.reduce((sum, d) => sum + d.orders, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Average Order</p>
            <p className="text-2xl font-bold text-gray-900">
              $
              {(
                data.reduce((sum, d) => sum + d.revenue, 0) /
                data.reduce((sum, d) => sum + d.orders, 0)
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
