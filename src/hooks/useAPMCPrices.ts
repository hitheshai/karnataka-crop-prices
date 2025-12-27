import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { crops, karnatakaDistricts, PriceData, Crop } from '@/data/karnataka-data';

interface APMCRecord {
  commodity: string;
  variety: string;
  district: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
}

interface APMCResponse {
  success: boolean;
  data: APMCRecord[];
  count: number;
  lastUpdated: string;
  error?: string;
}

// Map APMC commodity names to our crop IDs
const commodityToCropId: Record<string, string> = {
  'Paddy(Dhan)(Common)': '1',
  'Rice': '1',
  'Wheat': '2',
  'Ragi(Finger Millet)': '3',
  'Ragi': '3',
  'Jowar(Sorghum)': '4',
  'Sorghum': '4',
  'Maize': '5',
  'Arhar (Tur/Red Gram)(Whole)': '6',
  'Tur': '6',
  'Groundnut': '7',
  'Sunflower': '8',
  'Cotton': '9',
  'Sugarcane': '10',
  'Tomato': '11',
  'Onion': '12',
  'Potato': '13',
  'Green Chilli': '14',
  'Banana': '15',
  'Mango': '16',
  'Coconut': '17',
  'Arecanut(Whole Nut)': '18',
  'Arecanut': '18',
  'Coffee': '19',
  'Black Pepper': '20',
  'Cardamom': '21',
  'Turmeric': '22',
  'Bengal Gram(Gram)(Whole)': '23',
  'Chana': '23',
  'Green Gram (Moong)(Whole)': '24',
  'Moong': '24',
  'Soyabean': '25',
};

export const useAPMCPrices = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching live APMC prices...');
      
      const { data, error: invokeError } = await supabase.functions.invoke<APMCResponse>('get-apmc-prices', {
        body: { state: 'Karnataka' }
      });

      if (invokeError) {
        console.error('Error invoking function:', invokeError);
        throw new Error(invokeError.message);
      }

      if (!data?.success || !data.data) {
        console.error('API returned error:', data?.error);
        throw new Error(data?.error || 'Failed to fetch prices');
      }

      console.log(`Received ${data.data.length} APMC records`);

      // Transform APMC data to our PriceData format
      const transformedData: PriceData[] = [];
      
      data.data.forEach((record: APMCRecord) => {
        // Find matching crop ID
        const cropId = commodityToCropId[record.commodity];
        
        if (cropId) {
          // Normalize district name
          const normalizedDistrict = karnatakaDistricts.find(
            d => d.toLowerCase() === record.district.toLowerCase() ||
                 record.district.toLowerCase().includes(d.toLowerCase())
          ) || record.district;

          transformedData.push({
            cropId,
            district: normalizedDistrict,
            minPrice: record.minPrice,
            maxPrice: record.maxPrice,
            modalPrice: record.modalPrice,
            previousPrice: Math.round(record.modalPrice * (1 + (Math.random() * 0.1 - 0.05))), // Simulated previous price
            date: record.date,
            market: record.market
          });
        }
      });

      // If API returns no matching data, use fallback static data
      if (transformedData.length === 0) {
        console.log('No matching crops found, using fallback data');
        const fallbackData = generateFallbackData();
        setPriceData(fallbackData);
      } else {
        console.log(`Transformed ${transformedData.length} price records`);
        setPriceData(transformedData);
      }
      
      setLastUpdated(data.lastUpdated || new Date().toISOString());
    } catch (err) {
      console.error('Error fetching APMC prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      
      // Use fallback data on error
      const fallbackData = generateFallbackData();
      setPriceData(fallbackData);
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { priceData, loading, error, lastUpdated, refetch: fetchPrices };
};

// Generate static fallback data that doesn't change on refresh
const generateFallbackData = (): PriceData[] => {
  const today = new Date().toISOString().split('T')[0];
  const data: PriceData[] = [];
  
  // Static base prices (won't change on refresh)
  const basePrices: Record<string, { min: number; max: number; modal: number; prev: number }> = {
    "1": { min: 2350, max: 2650, modal: 2500, prev: 2480 },
    "2": { min: 2550, max: 2850, modal: 2700, prev: 2720 },
    "3": { min: 3350, max: 3650, modal: 3500, prev: 3450 },
    "4": { min: 2950, max: 3250, modal: 3100, prev: 3120 },
    "5": { min: 1950, max: 2250, modal: 2100, prev: 2080 },
    "6": { min: 6800, max: 7200, modal: 7000, prev: 6950 },
    "7": { min: 5800, max: 6200, modal: 6000, prev: 5980 },
    "8": { min: 5300, max: 5700, modal: 5500, prev: 5520 },
    "9": { min: 7000, max: 7500, modal: 7300, prev: 7250 },
    "10": { min: 340, max: 370, modal: 355, prev: 350 },
    "11": { min: 2000, max: 3000, modal: 2500, prev: 2600 },
    "12": { min: 1500, max: 2200, modal: 1850, prev: 1800 },
    "13": { min: 2000, max: 2400, modal: 2200, prev: 2150 },
    "14": { min: 3000, max: 4000, modal: 3500, prev: 3400 },
    "15": { min: 2000, max: 2600, modal: 2300, prev: 2280 },
    "16": { min: 4500, max: 7000, modal: 5750, prev: 5700 },
    "17": { min: 24000, max: 26000, modal: 25000, prev: 24800 },
    "18": { min: 44000, max: 46000, modal: 45000, prev: 44500 },
    "19": { min: 20000, max: 22000, modal: 21000, prev: 20800 },
    "20": { min: 48000, max: 52000, modal: 50000, prev: 49500 },
    "21": { min: 1400, max: 1600, modal: 1500, prev: 1480 },
    "22": { min: 13000, max: 15000, modal: 14000, prev: 13800 },
    "23": { min: 5800, max: 6200, modal: 6000, prev: 5950 },
    "24": { min: 7800, max: 8200, modal: 8000, prev: 7950 },
    "25": { min: 4800, max: 5200, modal: 5000, prev: 4980 },
  };

  // Only generate for major districts to reduce data size
  const majorDistricts = ["Bengaluru Urban", "Mysuru", "Belagavi", "Hubballi", "Dharwad", "Kalaburagi", "Mangaluru"];

  majorDistricts.forEach(district => {
    crops.forEach(crop => {
      const base = basePrices[crop.id];
      if (base) {
        data.push({
          cropId: crop.id,
          district,
          minPrice: base.min,
          maxPrice: base.max,
          modalPrice: base.modal,
          previousPrice: base.prev,
          date: today,
          market: `${district} APMC`
        });
      }
    });
  });

  return data;
};
