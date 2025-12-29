import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface APMCRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

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

// Mapping between our crop names and AGMARKNET commodity names
const cropMapping: Record<string, string[]> = {
  "1": ["Paddy(Dhan)(Common)", "Paddy", "Rice"],
  "2": ["Wheat", "Wheat(Local)"],
  "3": ["Ragi (Finger Millet)", "Ragi", "Finger Millet"],
  "4": ["Jowar(Sorghum)", "Jowar", "Sorghum"],
  "5": ["Maize", "Maize (Local)"],
  "6": ["Arhar (Tur/Red Gram)(Whole)", "Tur", "Arhar", "Red Gram"],
  "7": ["Groundnut", "Groundnut (With Shell)", "Ground Nut"],
  "8": ["Sunflower", "Sunflower Seed"],
  "9": ["Cotton", "Cotton (Kapas)", "Kapas"],
  "10": ["Sugarcane", "Gur(Jaggery)"],
  "11": ["Tomato", "Tomato(Local)"],
  "12": ["Onion", "Onion(Local)"],
  "13": ["Potato", "Potato(Local)"],
  "14": ["Green Chilli", "Chilli(Green)"],
  "15": ["Banana", "Banana - Loss Free"],
  "16": ["Mango", "Mango(Langra/Safeda)"],
  "17": ["Coconut", "Copra (Coconut)", "Coconut Oil Cake"],
  "18": ["Arecanut", "Areca Nut(Betelnut)"],
  "19": ["Coffee", "Coffee"],
  "20": ["Black Pepper", "Black pepper", "Pepper"],
  "21": ["Cardamom", "Cardamom"],
  "22": ["Turmeric", "Turmeric(Finger)", "Turmeric"],
  "23": ["Bengal Gram(Gram)(Whole)", "Bengal Gram", "Chana"],
  "24": ["Green Gram (Moong)(Whole)", "Green Gram", "Moong"],
  "25": ["Soyabean", "Soybean"],
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('DATA_GOV_IN_API_KEY');
    
    if (!apiKey) {
      console.error('DATA_GOV_IN_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured', data: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch data from data.gov.in APMC API for Karnataka
    const apiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=1000&filters[state]=Karnataka`;
    
    console.log('Fetching APMC data from data.gov.in...');
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch APMC data', data: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const apiData = await response.json();
    console.log('API Response received, records count:', apiData.records?.length || 0);

    if (!apiData.records || apiData.records.length === 0) {
      console.log('No records found in API response');
      return new Response(
        JSON.stringify({ error: null, data: [], message: 'No data available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process and map the data
    const priceDataMap = new Map<string, PriceData>();

    for (const record of apiData.records as APMCRecord[]) {
      const commodity = record.commodity?.toLowerCase() || '';
      const district = record.district || '';
      const market = record.market || '';
      
      // Find matching crop
      let matchedCropId: string | null = null;
      for (const [cropId, aliases] of Object.entries(cropMapping)) {
        if (aliases.some(alias => commodity.includes(alias.toLowerCase()))) {
          matchedCropId = cropId;
          break;
        }
      }

      if (matchedCropId && district) {
        const key = `${matchedCropId}-${district}`;
        const minPrice = parseFloat(record.min_price) || 0;
        const maxPrice = parseFloat(record.max_price) || 0;
        const modalPrice = parseFloat(record.modal_price) || 0;

        if (modalPrice > 0 && !priceDataMap.has(key)) {
          priceDataMap.set(key, {
            cropId: matchedCropId,
            cropName: record.commodity,
            district,
            minPrice,
            maxPrice,
            modalPrice,
            previousPrice: Math.round(modalPrice * (1 + (Math.random() * 0.1 - 0.05))), // Simulate previous price
            date: record.arrival_date || new Date().toISOString().split('T')[0],
            market: `${market} APMC`
          });
        }
      }
    }

    const priceData = Array.from(priceDataMap.values());
    console.log('Processed price data count:', priceData.length);

    return new Response(
      JSON.stringify({ error: null, data: priceData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching APMC prices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, data: null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
