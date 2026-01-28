import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import DistrictSelector from "@/components/DistrictSelector";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import CropPriceCard from "@/components/CropPriceCard";
import StatsBar from "@/components/StatsBar";
import ScrollToTop from "@/components/ScrollToTop";
import LoginStats from "@/components/LoginStats";
import { crops, PriceData } from "@/data/karnataka-data";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAPMCPrices } from "@/hooks/useAPMCPrices";

const Index = () => {
  const { user } = useAuth();
  const { priceData, loading: pricesLoading, isLiveData, lastUpdated } = useAPMCPrices();
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        // First try to get name from user metadata
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
        if (metaName) {
          setUserName(metaName);
          return;
        }
        
        // Otherwise fetch from profiles table
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (data?.full_name) {
          setUserName(data.full_name);
        } else {
          // Fallback to email prefix
          setUserName(user.email?.split('@')[0] || null);
        }
      }
    };
    
    fetchUserName();
  }, [user]);

  const formattedLastUpdated = lastUpdated.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const filteredData = useMemo(() => {
    let filtered = priceData;

    // Filter by district
    if (selectedDistrict !== "all") {
      filtered = filtered.filter(item => item.district === selectedDistrict);
    } else {
      // When all districts, get unique crops with aggregated prices
      const uniqueCrops = new Map<string, PriceData>();
      filtered.forEach(item => {
        if (!uniqueCrops.has(item.cropId)) {
          uniqueCrops.set(item.cropId, item);
        }
      });
      filtered = Array.from(uniqueCrops.values());
    }

    // Filter by category
    if (selectedCategory !== "all") {
      const categoryCropIds = crops
        .filter(c => c.category === selectedCategory)
        .map(c => c.id);
      filtered = filtered.filter(item => categoryCropIds.includes(item.cropId));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchingCropIds = crops
        .filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.localName.toLowerCase().includes(query)
        )
        .map(c => c.id);
      filtered = filtered.filter(item => matchingCropIds.includes(item.cropId));
    }

    return filtered;
  }, [priceData, selectedDistrict, selectedCategory, searchQuery]);

  const getCrop = (cropId: string) => crops.find(c => c.id === cropId);

  return (
    <div className="min-h-screen bg-background overscroll-none">
      <Header lastUpdated={formattedLastUpdated} isLive={isLiveData} />
      <ScrollToTop />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Message */}
        {user && userName && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-display font-semibold text-foreground">
              🌾 Welcome back, <span className="text-primary">{userName}</span>!
            </h1>
            <p className="text-muted-foreground mt-1">
              Check today's market prices and make informed decisions for your crops.
            </p>
          </div>
        )}

        {/* Login Stats - Only for logged in users */}
        <LoginStats />

        {/* Stats Overview */}
        <StatsBar filteredData={filteredData} />

        {/* Filters Section */}
        <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border/50 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <DistrictSelector
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
            />
            <div className="flex-1">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-foreground">
            {selectedDistrict === "all" ? "All Districts" : selectedDistrict} Prices
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredData.length} crops found
          </span>
        </div>

        {/* Price Cards Grid */}
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item, index) => {
              const crop = getCrop(item.cropId);
              if (!crop) return null;
              return (
                <CropPriceCard
                  key={`${item.cropId}-${item.district}`}
                  crop={crop}
                  priceData={item}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No crops found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Karnataka Agricultural Market Price Information System</p>
          <p className="mt-1">Data sourced from APMC markets across Karnataka</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
