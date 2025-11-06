import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { data: overview } = trpc.analytics.overview.useQuery({});
  const { data: categoryBreakdown } = trpc.analytics.categoryBreakdown.useQuery();
  const { data: fundPerformance } = trpc.analytics.fundPerformance.useQuery({
    limit: 10,
  });

  // Prepare data for charts
  const categoryData = categoryBreakdown?.map((cat) => ({
    name: cat.category,
    aum: Number(cat.totalAUM),
    funds: Number(cat.fundCount),
    avgReturn: Number(cat.averageReturn) * 100,
  }));

  const performanceData = fundPerformance?.map((fund) => ({
    name: fund.ticker,
    ytd: Number(fund.ytdReturn || 0) * 100,
    oneYear: Number(fund.oneYearReturn || 0) * 100,
    threeYear: Number(fund.threeYearReturn || 0) * 100,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into fund performance and sales trends
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Funds by Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview?.topFunds?.slice(0, 5).map((fund, index) => (
                    <div key={fund.fundId} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{fund.fundName}</p>
                        <p className="text-xs text-muted-foreground">
                          {fund.fundTicker}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(Number(fund.totalSales))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fund.transactionCount} sales
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total AUM
                    </span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(Number(overview?.totalAUM || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Revenue
                    </span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(Number(overview?.totalRevenue || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Average Transaction
                    </span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(
                        Number(overview?.averageTransactionSize || 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Transactions
                    </span>
                    <span className="text-lg font-semibold">
                      {overview?.totalTransactions || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fund Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ytd" fill="#0088FE" name="YTD Return %" />
                  <Bar dataKey="oneYear" fill="#00C49F" name="1Y Return %" />
                  <Bar dataKey="threeYear" fill="#FFBB28" name="3Y Return %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AUM by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="aum"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {categoryData?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData?.map((cat) => (
                    <div key={cat.name} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-sm text-green-600">
                          {formatPercentage(cat.avgReturn)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{cat.funds} funds</span>
                        <span>{formatCurrency(cat.aum)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
