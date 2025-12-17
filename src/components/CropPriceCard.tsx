import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Crop, PriceData } from "@/data/karnataka-data";
import { cn } from "@/lib/utils";

interface CropPriceCardProps {
  crop: Crop;
  priceData: PriceData;
  index: number;
}

const CropPriceCard = ({ crop, priceData, index }: CropPriceCardProps) => {
  const priceChange = priceData.modalPrice - priceData.previousPrice;
  const percentChange = ((priceChange / priceData.previousPrice) * 100).toFixed(1);
  const isUp = priceChange > 0;
  const isDown = priceChange < 0;
  const isStable = priceChange === 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up border-border/50 bg-card"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Crop Icon Section */}
          <div className="w-20 bg-secondary flex items-center justify-center text-4xl p-4">
            {crop.image}
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{crop.name}</h3>
                <p className="text-sm text-muted-foreground">{crop.localName}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {crop.category}
              </span>
            </div>
            
            {/* Price Section */}
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Modal Price / {crop.unit}</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(priceData.modalPrice)}
                </p>
              </div>
              
              {/* Trend Indicator */}
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium",
                isUp && "bg-success/10 text-success",
                isDown && "bg-destructive/10 text-destructive",
                isStable && "bg-muted text-muted-foreground"
              )}>
                {isUp && <TrendingUp className="w-4 h-4" />}
                {isDown && <TrendingDown className="w-4 h-4" />}
                {isStable && <Minus className="w-4 h-4" />}
                <span>{isUp ? "+" : ""}{percentChange}%</span>
              </div>
            </div>
            
            {/* Price Range */}
            <div className="mt-3 pt-3 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
              <span>Min: {formatPrice(priceData.minPrice)}</span>
              <span>Max: {formatPrice(priceData.maxPrice)}</span>
            </div>
          </div>
        </div>
        
        {/* Market Info Footer */}
        <div className="px-4 py-2 bg-muted/50 text-xs text-muted-foreground flex justify-between">
          <span>{priceData.market}</span>
          <span>{new Date(priceData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CropPriceCard;
