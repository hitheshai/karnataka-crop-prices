import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { karnatakaDistricts } from "@/data/karnataka-data";

interface DistrictSelectorProps {
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
}

const DistrictSelector = ({ selectedDistrict, onDistrictChange }: DistrictSelectorProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Select District
      </label>
      <Select value={selectedDistrict} onValueChange={onDistrictChange}>
        <SelectTrigger className="w-full md:w-[280px] bg-card border-border">
          <SelectValue placeholder="Choose a district" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">All Districts</SelectItem>
          {karnatakaDistricts.map((district) => (
            <SelectItem key={district} value={district}>
              {district}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DistrictSelector;
