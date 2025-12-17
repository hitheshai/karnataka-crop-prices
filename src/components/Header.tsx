import { Leaf, RefreshCw } from "lucide-react";

interface HeaderProps {
  lastUpdated: string;
}

const Header = ({ lastUpdated }: HeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Karnataka Krishi Mandi
              </h1>
              <p className="text-primary-foreground/80 text-sm md:text-base">
                Daily Crop Market Prices Across 31 Districts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm bg-primary-foreground/10 px-4 py-2 rounded-lg">
            <RefreshCw className="w-4 h-4 animate-pulse-slow" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
