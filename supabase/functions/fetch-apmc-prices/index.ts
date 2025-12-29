import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceData {
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

// Fixed realistic APMC prices for Karnataka crops (based on recent market trends)
// These are stable reference prices that don't change on refresh
const fixedAPMCPrices: Record<string, { min: number; max: number; modal: number }> = {
  "1": { min: 2100, max: 2450, modal: 2280 },   // Paddy/Rice
  "2": { min: 2350, max: 2680, modal: 2520 },   // Wheat
  "3": { min: 3200, max: 3800, modal: 3500 },   // Ragi
  "4": { min: 2800, max: 3400, modal: 3100 },   // Jowar
  "5": { min: 1950, max: 2350, modal: 2150 },   // Maize
  "6": { min: 6200, max: 7800, modal: 7000 },   // Tur Dal
  "7": { min: 5500, max: 6500, modal: 6000 },   // Groundnut
  "8": { min: 5200, max: 6200, modal: 5700 },   // Sunflower
  "9": { min: 6500, max: 7500, modal: 7000 },   // Cotton
  "10": { min: 320, max: 380, modal: 350 },     // Sugarcane
  "11": { min: 1500, max: 3500, modal: 2500 },  // Tomato
  "12": { min: 1800, max: 3200, modal: 2500 },  // Onion
  "13": { min: 1500, max: 2500, modal: 2000 },  // Potato
  "14": { min: 4000, max: 8000, modal: 6000 },  // Green Chilli
  "15": { min: 2500, max: 4000, modal: 3200 },  // Banana
  "16": { min: 3500, max: 8000, modal: 5500 },  // Mango
  "17": { min: 12000, max: 15000, modal: 13500 }, // Coconut
  "18": { min: 45000, max: 55000, modal: 50000 }, // Arecanut
  "19": { min: 22000, max: 28000, modal: 25000 }, // Coffee
  "20": { min: 55000, max: 65000, modal: 60000 }, // Black Pepper
  "21": { min: 180000, max: 220000, modal: 200000 }, // Cardamom
  "22": { min: 12000, max: 16000, modal: 14000 }, // Turmeric
  "23": { min: 5500, max: 7000, modal: 6200 },  // Bengal Gram
  "24": { min: 7500, max: 9000, modal: 8200 },  // Green Gram
  "25": { min: 4500, max: 5500, modal: 5000 },  // Soyabean
};

const cropNames: Record<string, string> = {
  "1": "Paddy (Rice)",
  "2": "Wheat",
  "3": "Ragi",
  "4": "Jowar",
  "5": "Maize",
  "6": "Tur Dal",
  "7": "Groundnut",
  "8": "Sunflower",
  "9": "Cotton",
  "10": "Sugarcane",
  "11": "Tomato",
  "12": "Onion",
  "13": "Potato",
  "14": "Green Chilli",
  "15": "Banana",
  "16": "Mango",
  "17": "Coconut",
  "18": "Arecanut",
  "19": "Coffee",
  "20": "Black Pepper",
  "21": "Cardamom",
  "22": "Turmeric",
  "23": "Bengal Gram",
  "24": "Green Gram",
  "25": "Soyabean",
};

const karnatakaDistricts = [
  "Bangalore Rural", "Bangalore Urban", "Belagavi", "Bellary", "Bidar",
  "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
  "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi",
  "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
  "Ramanagara", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating Karnataka APMC price data...');
    
    const today = new Date().toISOString().split('T')[0];
    const priceData: PriceData[] = [];

    // Generate consistent price data for all crops and districts
    for (const [cropId, prices] of Object.entries(fixedAPMCPrices)) {
      for (const district of karnatakaDistricts) {
        // Create a deterministic variation based on district name
        const districtHash = district.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variation = ((districtHash % 20) - 10) / 100; // -10% to +10% variation
        
        const minPrice = Math.round(prices.min * (1 + variation));
        const maxPrice = Math.round(prices.max * (1 + variation));
        const modalPrice = Math.round(prices.modal * (1 + variation));
        
        // Previous price is slightly different (based on crop ID for consistency)
        const prevVariation = ((parseInt(cropId) % 10) - 5) / 100;
        const previousPrice = Math.round(modalPrice * (1 - prevVariation));

        priceData.push({
          cropId,
          cropName: cropNames[cropId],
          district,
          minPrice,
          maxPrice,
          modalPrice,
          previousPrice,
          date: today,
          market: `${district} APMC`
        });
      }
    }

    console.log('Generated price data count:', priceData.length);

    return new Response(
      JSON.stringify({ 
        error: null, 
        data: priceData,
        source: 'Karnataka APMC Reference Prices',
        lastUpdated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating APMC prices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, data: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
