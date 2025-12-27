import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get('DATA_GOV_IN_API_KEY');

interface APMCRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state = "Karnataka", commodity } = await req.json().catch(() => ({}));
    
    console.log(`Fetching APMC prices for state: ${state}, commodity: ${commodity || 'all'}`);
    
    if (!API_KEY) {
      console.error('DATA_GOV_IN_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build API URL for data.gov.in
    // Resource ID for "Current Daily Price of Various Commodities from Various Markets (Mandi)"
    const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
    let apiUrl = `https://api.data.gov.in/resource/${resourceId}?api-key=${API_KEY}&format=json&limit=500`;
    
    // Filter by state (Karnataka)
    apiUrl += `&filters[state]=${encodeURIComponent(state)}`;
    
    // Filter by commodity if provided
    if (commodity) {
      apiUrl += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    }

    console.log(`Calling API: ${apiUrl.replace(API_KEY, '***')}`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `API returned ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Received ${data.records?.length || 0} records from API`);

    // Transform the data to match our frontend format
    const records: APMCRecord[] = data.records || [];
    
    // Group by commodity and district, take the latest record for each
    const groupedData = new Map<string, APMCRecord>();
    
    records.forEach((record: APMCRecord) => {
      const key = `${record.commodity}-${record.district}`;
      const existing = groupedData.get(key);
      
      if (!existing) {
        groupedData.set(key, record);
      } else {
        // Keep the more recent record
        const existingDate = new Date(existing.arrival_date);
        const newDate = new Date(record.arrival_date);
        if (newDate > existingDate) {
          groupedData.set(key, record);
        }
      }
    });

    const transformedData = Array.from(groupedData.values()).map(record => ({
      commodity: record.commodity,
      variety: record.variety,
      district: record.district,
      market: record.market,
      minPrice: parseInt(record.min_price) || 0,
      maxPrice: parseInt(record.max_price) || 0,
      modalPrice: parseInt(record.modal_price) || 0,
      date: record.arrival_date,
    }));

    console.log(`Returning ${transformedData.length} transformed records`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: transformedData,
        count: transformedData.length,
        lastUpdated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in get-apmc-prices function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

