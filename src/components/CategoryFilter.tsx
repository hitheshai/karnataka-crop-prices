import { categories } from "@/data/karnataka-data";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange("all")}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          selectedCategory === "all"
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        All Crops
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selectedCategory === category
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
