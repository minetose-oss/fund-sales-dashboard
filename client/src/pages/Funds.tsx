import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function Funds() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>();

  const { data: funds, isLoading } = trpc.funds.list.useQuery({
    search,
    category,
    sortBy: 'ytdReturn',
    sortOrder: 'desc',
    limit: 50,
  });

  const { data: categories } = trpc.funds.categories.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fund Database</h1>
        <p className="text-muted-foreground">
          Browse and manage your investment funds
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search funds by name or ticker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={category || ''}
              onChange={(e) => setCategory(e.target.value || undefined)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Funds Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading funds...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {funds?.map((fund) => (
            <Card key={fund.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{fund.ticker}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {fund.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Number(fund.ytdReturn || 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{fund.category}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">AUM</p>
                      <p className="text-sm font-medium">
                        {formatCurrency(Number(fund.aum))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">YTD Return</p>
                      <p
                        className={`text-sm font-medium ${
                          Number(fund.ytdReturn || 0) >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(Number(fund.ytdReturn || 0) * 100)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Expense Ratio</p>
                      <p className="text-sm font-medium">
                        {(Number(fund.expenseRatio) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Risk</p>
                      <p className="text-sm font-medium">{fund.riskRating}</p>
                    </div>
                  </div>
                  {fund.morningstarRating && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Morningstar Rating
                      </p>
                      <p className="text-sm">
                        {'★'.repeat(fund.morningstarRating)}
                        {'☆'.repeat(5 - fund.morningstarRating)}
                      </p>
                    </div>
                  )}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
