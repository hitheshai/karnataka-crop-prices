import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
  "26": { min: 1200, max: 2200, modal: 1700 },  // Papaya
  "27": { min: 1500, max: 2500, modal: 2000 },  // Guava
  "28": { min: 4500, max: 7500, modal: 6000 },  // Pomegranate
  "29": { min: 800, max: 1800, modal: 1300 },   // Watermelon
  "30": { min: 2000, max: 3500, modal: 2750 },  // Sapota
  "31": { min: 3500, max: 6500, modal: 5000 },  // Grapes
  "32": { min: 1500, max: 3000, modal: 2250 },  // Jackfruit
  "33": { min: 2500, max: 4500, modal: 3500 },  // Orange
  "34": { min: 2000, max: 3500, modal: 2750 },  // Pineapple
  "35": { min: 3000, max: 6000, modal: 4500 },  // Lime
  "36": { min: 1000, max: 2500, modal: 1750 },  // Brinjal
  "37": { min: 1500, max: 3000, modal: 2250 },  // Okra
  "38": { min: 1200, max: 2800, modal: 2000 },  // Bitter Gourd
  "39": { min: 800, max: 1800, modal: 1300 },   // Ridge Gourd
  "40": { min: 600, max: 1500, modal: 1050 },   // Bottle Gourd
  "41": { min: 2000, max: 4500, modal: 3250 },  // Capsicum
  "42": { min: 1500, max: 3000, modal: 2250 },  // Cauliflower
  "43": { min: 800, max: 2000, modal: 1400 },   // Cabbage
  "44": { min: 1500, max: 3000, modal: 2250 },  // Carrot
  "45": { min: 2000, max: 4000, modal: 3000 },  // Drumstick
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
  "26": "Papaya",
  "27": "Guava",
  "28": "Pomegranate",
  "29": "Watermelon",
  "30": "Sapota (Chikoo)",
  "31": "Grapes",
  "32": "Jackfruit",
  "33": "Orange",
  "34": "Pineapple",
  "35": "Lime",
  "36": "Brinjal",
  "37": "Okra (Lady's Finger)",
  "38": "Bitter Gourd",
  "39": "Ridge Gourd",
  "40": "Bottle Gourd",
  "41": "Capsicum",
  "42": "Cauliflower",
  "43": "Cabbage",
  "44": "Carrot",
  "45": "Drumstick",
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
