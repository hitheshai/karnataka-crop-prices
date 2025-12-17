import { TrendingUp, TrendingDown, BarChart3, Wheat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PriceData, crops } from "@/data/karnataka-data";

interface StatsBarProps {
  filteredData: PriceData[];
}

const StatsBar = ({ filteredData }: StatsBarProps) => {
  const topGainer = filteredData.reduce((max, item) => {
    const change = ((item.modalPrice - item.previousPrice) / item.previousPrice) * 100;
    const maxChange = ((max.modalPrice - max.previousPrice) / max.previousPrice) * 100;
    return change > maxChange ? item : max;
  }, filteredData[0]);

  const topLoser = filteredData.reduce((min, item) => {
    const change = ((item.modalPrice - item.previousPrice) / item.previousPrice) * 100;
    const minChange = ((min.modalPrice - min.previousPrice) / min.previousPrice) * 100;
    return change < minChange ? item : min;
  }, filteredData[0]);

  const avgPrice = Math.round(
    filteredData.reduce((sum, item) => sum + item.modalPrice, 0) / filteredData.length
  );

  const getCropName = (cropId: string) => crops.find(c => c.id === cropId)?.name || "Unknown";

  const stats = [
    {
      label: "Total Crops",
      value: new Set(filteredData.map(d => d.cropId)).size.toString(),
      icon: Wheat,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Top Gainer",
      value: getCropName(topGainer?.cropId || ""),
      subValue: topGainer ? `+${(((topGainer.modalPrice - topGainer.previousPrice) / topGainer.previousPrice) * 100).toFixed(1)}%` : "",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Top Loser",
      value: getCropName(topLoser?.cropId || ""),
      subValue: topLoser ? `${(((topLoser.modalPrice - topLoser.previousPrice) / topLoser.previousPrice) * 100).toFixed(1)}%` : "",
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Avg. Price",
      value: `₹${avgPrice.toLocaleString('en-IN')}`,
      icon: BarChart3,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-semibold text-foreground truncate">{stat.value}</p>
              {stat.subValue && (
                <p className={`text-xs font-medium ${stat.color}`}>{stat.subValue}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsBar;
