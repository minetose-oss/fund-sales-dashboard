import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Newspaper } from 'lucide-react';

export default function Insights() {
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const { data: insights } = trpc.insights.list.useQuery({
    category: selectedCategory,
    limit: 50,
  });

  const { data: categories } = trpc.insights.categories.useQuery();
  const { data: sentimentAnalysis } = trpc.insights.sentimentAnalysis.useQuery({});

  const getSentimentIcon = (sentiment: string | null) => {
    if (sentiment === 'positive')
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (sentiment === 'negative')
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getSentimentColor = (sentiment: string | null) => {
    if (sentiment === 'positive') return 'bg-green-100 text-green-800';
    if (sentiment === 'negative') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Newspaper className="h-8 w-8" />
          Market Insights
        </h1>
        <p className="text-muted-foreground">
          Stay informed with the latest market news and analysis
        </p>
      </div>

      {/* Sentiment Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sentimentAnalysis?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Positive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {sentimentAnalysis?.sentimentBreakdown.positive || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {sentimentAnalysis?.sentimentPercentages.positive.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Negative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {sentimentAnalysis?.sentimentBreakdown.negative || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {sentimentAnalysis?.sentimentPercentages.negative.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Minus className="h-4 w-4 text-gray-600" />
              Neutral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-600">
              {sentimentAnalysis?.sentimentBreakdown.neutral || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {sentimentAnalysis?.sentimentPercentages.neutral.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-full text-sm ${
                !selectedCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              All
            </button>
            {categories?.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {category.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <div className="grid gap-4">
        {insights?.map((insight) => (
          <Card key={insight.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getSentimentIcon(insight.sentiment)}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(
                        insight.sentiment
                      )}`}
                    >
                      {insight.sentiment}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {insight.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{insight.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {formatDate(insight.publishedAt)} •{' '}
                    {insight.source || 'Market Analysis'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{insight.content}</p>
              {insight.relevantTickers &&
                Array.isArray(insight.relevantTickers) &&
                insight.relevantTickers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Related Funds:</span>
                    <div className="flex gap-2">
                      {insight.relevantTickers.map((ticker) => (
                        <span
                          key={ticker}
                          className="px-2 py-1 text-xs bg-secondary rounded"
                        >
                          {ticker}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
