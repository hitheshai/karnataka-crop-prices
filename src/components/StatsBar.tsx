import { TrendingUp, TrendingDown, BarChart3, Wheat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PriceData, crops } from "@/data/karnataka-data";

interface StatsBarProps {
  filteredData: PriceData[];
}

const StatsBar = ({ filteredData }: StatsBarProps) => {
  const safeData = filteredData ?? [];

  if (safeData.length === 0) {
    const stats = [
      {
        label: "Total Crops",
        value: "0",
        icon: Wheat,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        label: "Top Gainer",
        value: "-",
        subValue: "",
        icon: TrendingUp,
        color: "text-success",
        bgColor: "bg-success/10",
      },
      {
        label: "Top Loser",
        value: "-",
        subValue: "",
        icon: TrendingDown,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      },
      {
        label: "Avg. Price",
        value: "₹0",
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topGainer = safeData.reduce((max, item) => {
    const base = item.previousPrice || item.modalPrice || 1;
    const maxBase = max.previousPrice || max.modalPrice || 1;
    const change = ((item.modalPrice - base) / base) * 100;
    const maxChange = ((max.modalPrice - maxBase) / maxBase) * 100;
    return change > maxChange ? item : max;
  }, safeData[0]);

  const topLoser = safeData.reduce((min, item) => {
    const base = item.previousPrice || item.modalPrice || 1;
    const minBase = min.previousPrice || min.modalPrice || 1;
    const change = ((item.modalPrice - base) / base) * 100;
    const minChange = ((min.modalPrice - minBase) / minBase) * 100;
    return change < minChange ? item : min;
  }, safeData[0]);

  const avgPrice = Math.round(
    safeData.reduce((sum, item) => sum + (item.modalPrice || 0), 0) / safeData.length
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
