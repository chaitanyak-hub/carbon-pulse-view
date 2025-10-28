import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SiteActivityFilters {
  utmSource: string;
  from: string;
  to: string;
  siteType?: string;
  includeSiteDetails?: boolean;
  limit?: number;
  offset?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the fixed API key for the new endpoint
    const apiKey = 'U2FsdGVkX192qixrCGGatPyyOZ5JgJlfXxYWqyouY86AVVRAkktVgOiAwm93hdkGaX/DbFqO5qeqcE9+ael15g==';
    
    const { filters }: { filters: SiteActivityFilters } = await req.json();
    
    console.log('=== API PROXY REQUEST ===');
    console.log('Filters received:', filters);

    // Build query parameters with new format
    const params = new URLSearchParams();
    params.append('utmSource', filters.utmSource);
    params.append('from', filters.from);
    params.append('to', filters.to);
    params.append('siteType', filters.siteType || 'domestic');
    if (filters.includeSiteDetails !== undefined) {
      params.append('includeSiteDetails', String(filters.includeSiteDetails));
    }
    if (filters.limit !== undefined) {
      params.append('limit', String(filters.limit));
    }
    if (filters.offset !== undefined) {
      params.append('offset', String(filters.offset));
    }

    const url = `https://api.thelabrador.co.uk/carbon/v3/site-activity?${params.toString()}`;
    
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'e_api_key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return new Response(JSON.stringify({ 
        error: `API request failed: ${response.status} ${response.statusText}` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('API response received, sites length:', data?.data?.sites?.length || 0, 'pagination:', data?.data?.pagination);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in fetch-site-activity function:', error);
    return new Response(JSON.stringify({ 
      error: `Proxy error: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});