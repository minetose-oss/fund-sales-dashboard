import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, DollarSign, Activity, Users } from 'lucide-react';
import { socket, connectSocket } from '@/lib/socket';

export default function Dashboard() {
  const [realTimeUpdates, setRealTimeUpdates] = useState(0);

  const { data: overview } = trpc.analytics.overview.useQuery({});
  const { data: topFunds } = trpc.funds.topPerformers.useQuery({ limit: 5 });
  const { data: recentSales } = trpc.sales.recentActivity.useQuery({ limit: 5 });
  const { data: latestInsights } = trpc.insights.latest.useQuery({ limit: 3 });

  useEffect(() => {
    connectSocket();
    socket.emit('subscribe:sales');
    socket.emit('subscribe:analytics');
    socket.emit('subscribe:insights');

    socket.on('sale:new', () => {
      setRealTimeUpdates((prev) => prev + 1);
    });

    return () => {
      socket.off('sale:new');
    };
  }, []);

  const stats = [
    {
      title: 'Total AUM',
      value: formatCurrency(Number(overview?.totalAUM || 0)),
      icon: DollarSign,
      description: 'Assets Under Management',
      trend: '+12.5%',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(Number(overview?.totalRevenue || 0)),
      icon: TrendingUp,
      description: 'Year to Date',
      trend: '+8.2%',
    },
    {
      title: 'Total Transactions',
      value: overview?.totalTransactions || 0,
      icon: Activity,
      description: 'All time',
      trend: '+23.1%',
    },
    {
      title: 'Active Funds',
      value: overview?.fundCount || 0,
      icon: Users,
      description: 'Currently managed',
      trend: '+4.5%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your fund sales dashboard
          </p>
        </div>
        {realTimeUpdates > 0 && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
            {realTimeUpdates} new update{realTimeUpdates !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <p className="text-xs text-green-600 mt-1">{stat.trend} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performing Funds */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Funds</CardTitle>
          <CardDescription>Based on YTD returns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topFunds?.map((fund) => (
              <div
                key={fund.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{fund.name}</p>
                  <p className="text-sm text-muted-foreground">{fund.ticker}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatPercentage(Number(fund.ytdReturn || 0) * 100)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(Number(fund.aum))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales?.map((item) => (
                <div
                  key={item.sale.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{item.sale.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.fund?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(Number(item.sale.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.sale.saleDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
            <CardDescription>Latest market news</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestInsights?.map((insight) => (
                <div key={insight.id} className="border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.content.substring(0, 80)}...
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        insight.sentiment === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : insight.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {insight.sentiment}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(insight.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
