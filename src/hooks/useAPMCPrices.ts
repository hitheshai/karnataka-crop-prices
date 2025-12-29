import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { priceData as fallbackPriceData, PriceData, crops, karnatakaDistricts } from '@/data/karnataka-data';

interface APMCPriceResponse {
  cropId: string;
  cropName: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  previousPrice: number;
  date: string;
  market: string;
}

export const useAPMCPrices = () => {
  const [priceData, setPriceData] = useState<PriceData[]>(fallbackPriceData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLiveData, setIsLiveData] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        
        const { data, error: fetchError } = await supabase.functions.invoke('fetch-apmc-prices');
        
        if (fetchError) {
          console.error('Error fetching live prices:', fetchError);
          setError('Using offline data');
          setIsLiveData(false);
          return;
        }

        if (data?.error) {
          console.error('API error:', data.error);
          setError('Using offline data');
          setIsLiveData(false);
          return;
        }

        if (data?.data && data.data.length > 0) {
          // Merge live data with fallback for missing crops/districts
          const liveDataMap = new Map<string, PriceData>();
          
          (data.data as APMCPriceResponse[]).forEach((item) => {
            const key = `${item.cropId}-${item.district}`;
            liveDataMap.set(key, {
              cropId: item.cropId,
              district: item.district,
              minPrice: item.minPrice,
              maxPrice: item.maxPrice,
              modalPrice: item.modalPrice,
              previousPrice: item.previousPrice,
              date: item.date,
              market: item.market
            });
          });

          // Create complete dataset with live data where available, fallback otherwise
          const mergedData: PriceData[] = [];
          
          karnatakaDistricts.forEach(district => {
            crops.forEach(crop => {
              const key = `${crop.id}-${district}`;
              const livePrice = liveDataMap.get(key);
              
              if (livePrice) {
                mergedData.push(livePrice);
              } else {
                // Use fallback data for missing entries
                const fallback = fallbackPriceData.find(
                  p => p.cropId === crop.id && p.district === district
                );
                if (fallback) {
                  mergedData.push(fallback);
                }
              }
            });
          });

          setPriceData(mergedData.length > 0 ? mergedData : fallbackPriceData);
          setIsLiveData(true);
          setLastUpdated(new Date());
          setError(null);
        } else {
          // No live data available, use fallback
          setIsLiveData(false);
          setError('Live data unavailable');
        }
      } catch (err) {
        console.error('Failed to fetch prices:', err);
        setError('Using offline data');
        setIsLiveData(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchPrices, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { priceData, loading, error, lastUpdated, isLiveData };
};
