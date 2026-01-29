import React from 'react';
import { Card, CardContent } from '../atoms';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
}) => {
  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
            {trend && (
              <div className="mt-2 flex items-center text-sm">
                <span
                  className={
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="ml-2 text-gray-500">vs last month</span>
              </div>
            )}
            {description && (
              <p className="mt-2 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
