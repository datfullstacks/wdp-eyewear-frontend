'use client';

import { useMemo } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type ChartDatum = {
  label: string;
  value: number;
  color: string;
  hint?: string;
};

type ValueFormatter = (value: number) => string;

type TrendSeries = {
  label: string;
  color: string;
  values: number[];
  fill?: boolean;
};

const defaultFormatter: ValueFormatter = (value) =>
  new Intl.NumberFormat('vi-VN').format(value || 0);

const compactFormatter: ValueFormatter = (value) =>
  new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);

function toSafeNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatTooltipValue(value: unknown, formatter: ValueFormatter) {
  if (Array.isArray(value)) {
    return formatter(Number(value[0] || 0));
  }

  return formatter(Number(value || 0));
}

export function DonutBreakdown({
  data,
  centerLabel,
  valueFormatter = defaultFormatter,
  emptyLabel = 'No data',
}: {
  data: ChartDatum[];
  centerLabel: string;
  valueFormatter?: ValueFormatter;
  emptyLabel?: string;
}) {
  const safeData = useMemo(
    () =>
      (Array.isArray(data) ? data : [])
        .map((item) => ({
          ...item,
          value: toSafeNumber(item.value),
        }))
        .filter((item) => item.value > 0),
    [data],
  );
  const total = safeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
      <div className="relative mx-auto h-56 w-full max-w-[240px] flex-shrink-0">
        {safeData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-full border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={64}
                  outerRadius={94}
                  paddingAngle={safeData.length > 1 ? 2 : 0}
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {safeData.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatTooltipValue(value, valueFormatter)}
                  contentStyle={{
                    borderRadius: 14,
                    borderColor: '#e5e7eb',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-semibold text-gray-900">
                {valueFormatter(total)}
              </div>
              <div className="mt-1 max-w-24 text-xs uppercase tracking-[0.2em] text-gray-500">
                {centerLabel}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        {safeData.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          safeData.map((item) => {
            const share = total > 0 ? (item.value / total) * 100 : 0;

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate font-medium text-gray-700">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2 text-gray-900">
                    <span>{valueFormatter(item.value)}</span>
                    <span className="text-xs text-gray-500">
                      {share.toFixed(0)}%
                    </span>
                  </div>
                </div>
                {item.hint ? (
                  <div className="text-xs text-gray-500">{item.hint}</div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function DistributionBars({
  data,
  valueFormatter = defaultFormatter,
  emptyLabel = 'No data',
}: {
  data: ChartDatum[];
  valueFormatter?: ValueFormatter;
  emptyLabel?: string;
}) {
  const safeData = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((item) => ({
        ...item,
        value: toSafeNumber(item.value),
      })),
    [data],
  );
  const chartHeight = Math.max(220, safeData.length * 58);

  if (safeData.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safeData}
            layout="vertical"
            margin={{ top: 4, right: 12, bottom: 4, left: 12 }}
            barCategoryGap={14}
          >
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="#e5e7eb"
              strokeDasharray="4 6"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value: number) => compactFormatter(Number(value || 0))}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#374151', fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => formatTooltipValue(value, valueFormatter)}
              contentStyle={{
                borderRadius: 14,
                borderColor: '#e5e7eb',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
              {safeData.map((item) => (
                <Cell key={item.label} fill={item.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {safeData.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <div className="font-medium text-gray-700">{item.label}</div>
              {item.hint ? (
                <div className="text-xs text-gray-500">{item.hint}</div>
              ) : null}
            </div>
            <div className="flex-shrink-0 font-medium text-gray-900">
              {valueFormatter(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendComparisonChart({
  labels,
  series,
  valueFormatter = defaultFormatter,
}: {
  labels: string[];
  series: TrendSeries[];
  valueFormatter?: ValueFormatter;
}) {
  const normalizedSeries = useMemo(
    () =>
      (Array.isArray(series) ? series : []).map((item, index) => ({
        ...item,
        key: `series_${index}`,
        values: Array.isArray(item.values) ? item.values.map(toSafeNumber) : [],
      })),
    [series],
  );

  const chartData = useMemo(
    () =>
      (Array.isArray(labels) ? labels : []).map((label, index) => {
        const row: Record<string, string | number> = { label };

        normalizedSeries.forEach((item) => {
          row[item.key] = item.values[index] || 0;
        });

        return row;
      }),
    [labels, normalizedSeries],
  );

  const latestValues = normalizedSeries.map(
    (item) => item.values[item.values.length - 1] || 0,
  );

  if (!chartData.length || !normalizedSeries.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
        No trend data
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {normalizedSeries.map((item, index) => (
          <div
            key={item.label}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm"
          >
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-gray-700">{item.label}</span>
            <span className="ml-2 text-gray-500">
              {valueFormatter(latestValues[index] || 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 6" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={72}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value: number) => valueFormatter(Number(value || 0))}
              />
              <Tooltip
                formatter={(value) => formatTooltipValue(value, valueFormatter)}
                contentStyle={{
                  borderRadius: 14,
                  borderColor: '#e5e7eb',
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                }}
              />

              {normalizedSeries.map((item) =>
                item.fill ? (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    stroke={item.color}
                    strokeWidth={3}
                    fill={item.color}
                    fillOpacity={0.12}
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 5 }}
                  />
                ) : (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    stroke={item.color}
                    strokeWidth={3}
                    fillOpacity={0}
                    fill={item.color}
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 5 }}
                  />
                ),
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
