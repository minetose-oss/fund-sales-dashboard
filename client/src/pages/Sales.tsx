import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, TrendingUp, Activity } from 'lucide-react';

export default function Sales() {
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  const { data: salesList, isLoading } = trpc.sales.list.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
    limit: 100,
  });

  const { data: statistics } = trpc.sales.statistics.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const stats = [
    {
      title: 'Total Sales',
      value: formatCurrency(Number(statistics?.totalSales || 0)),
      icon: DollarSign,
      description: 'Total revenue',
    },
    {
      title: 'Transactions',
      value: statistics?.totalTransactions || 0,
      icon: Activity,
      description: 'Number of sales',
    },
    {
      title: 'Average Sale',
      value: formatCurrency(Number(statistics?.averageAmount || 0)),
      icon: TrendingUp,
      description: 'Per transaction',
    },
    {
      title: 'Total Commission',
      value: formatCurrency(Number(statistics?.totalCommission || 0)),
      icon: DollarSign,
      description: 'Earned commission',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and manage fund sales transactions
          </p>
        </div>
        <Button>New Sale</Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading sales...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Fund</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Units</th>
                    <th className="pb-3 font-medium">Sales Rep</th>
                    <th className="pb-3 font-medium">Commission</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesList?.map((item) => (
                    <tr key={item.sale.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 text-sm">
                        {formatDate(item.sale.saleDate)}
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium">
                            {item.sale.clientName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.sale.clientEmail}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium">
                            {item.fund?.ticker}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.fund?.name.substring(0, 30)}...
                          </p>
                        </div>
                      </td>
                      <td className="py-3 text-sm font-medium">
                        {formatCurrency(Number(item.sale.amount))}
                      </td>
                      <td className="py-3 text-sm">
                        {Number(item.sale.units).toFixed(2)}
                      </td>
                      <td className="py-3 text-sm">
                        {item.sale.salesRepName || '-'}
                      </td>
                      <td className="py-3 text-sm">
                        {item.sale.commission
                          ? formatCurrency(Number(item.sale.commission))
                          : '-'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.sale.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : item.sale.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
