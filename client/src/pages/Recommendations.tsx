import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function Recommendations() {
  const [profile, setProfile] = useState({
    riskTolerance: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    investmentHorizon: 'medium' as 'short' | 'medium' | 'long',
    investmentGoals: [] as string[],
    age: 35,
  });

  const [showResults, setShowResults] = useState(false);

  const generateMutation = trpc.recommendations.generate.useMutation();
  const { data: topRecommendations } = trpc.recommendations.topRecommendations.useQuery(
    { limit: 5 }
  );

  const handleGenerate = async () => {
    try {
      await generateMutation.mutateAsync({
        riskTolerance: profile.riskTolerance,
        investmentHorizon: profile.investmentHorizon,
        investmentGoals: profile.investmentGoals.length > 0
          ? profile.investmentGoals
          : ['growth', 'diversification'],
        age: profile.age,
      });
      setShowResults(true);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    }
  };

  const toggleGoal = (goal: string) => {
    setProfile((prev) => ({
      ...prev,
      investmentGoals: prev.investmentGoals.includes(goal)
        ? prev.investmentGoals.filter((g) => g !== goal)
        : [...prev.investmentGoals, goal],
    }));
  };

  const goals = [
    'Growth',
    'Income',
    'Diversification',
    'Capital Preservation',
    'Tax Efficiency',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          AI Recommendations
        </h1>
        <p className="text-muted-foreground">
          Get personalized fund recommendations powered by AI
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Investment Profile</CardTitle>
              <CardDescription>Configure client preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Risk Tolerance</Label>
                <select
                  value={profile.riskTolerance}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      riskTolerance: e.target.value as any,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <div>
                <Label>Investment Horizon</Label>
                <select
                  value={profile.investmentHorizon}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      investmentHorizon: e.target.value as any,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="short">Short-term (&lt; 3 years)</option>
                  <option value="medium">Medium-term (3-10 years)</option>
                  <option value="long">Long-term (&gt; 10 years)</option>
                </select>
              </div>

              <div>
                <Label>Age</Label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({ ...profile, age: parseInt(e.target.value) })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <Label>Investment Goals</Label>
                <div className="mt-2 space-y-2">
                  {goals.map((goal) => (
                    <label key={goal} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profile.investmentGoals.includes(
                          goal.toLowerCase()
                        )}
                        onChange={() => toggleGoal(goal.toLowerCase())}
                        className="rounded"
                      />
                      <span className="text-sm">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full"
              >
                {generateMutation.isPending
                  ? 'Generating...'
                  : 'Generate Recommendations'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {showResults && generateMutation.data ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Generated {generateMutation.data.recommendations.length}{' '}
                    Recommendations
                  </CardTitle>
                  <CardDescription>
                    Based on your investment profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generateMutation.data.recommendations.map((rec, index) => (
                      <Card key={rec.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {rec.fund.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {rec.fund.ticker} • {rec.fund.category}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-primary">
                                    {rec.score.toFixed(0)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Score
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 my-4 py-3 border-y">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    YTD Return
                                  </p>
                                  <p className="font-medium text-green-600">
                                    {formatPercentage(
                                      Number(rec.fund.ytdReturn || 0) * 100
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Risk
                                  </p>
                                  <p className="font-medium">
                                    {rec.fund.riskRating}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Confidence
                                  </p>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      rec.confidence === 'high'
                                        ? 'bg-green-100 text-green-800'
                                        : rec.confidence === 'medium'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {rec.confidence}
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground">
                                {rec.reasoning}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Top Recommendations</CardTitle>
                <CardDescription>
                  Recently generated high-confidence recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRecommendations?.map((item) => (
                    <div
                      key={item.recommendation.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.fund?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.fund?.ticker} • Score:{' '}
                          {Number(item.recommendation.recommendationScore).toFixed(
                            0
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {formatPercentage(
                            Number(item.fund?.ytdReturn || 0) * 100
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
