import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SiteActivityFilters {
  utmSource: string;
  from?: string;
  to?: string;
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
    if (filters.from) {
      params.append('from', filters.from);
    }
    if (filters.to) {
      params.append('to', filters.to);
    }
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

    const url = `http://domestic-prod-alb-terra-1678302567.eu-west-1.elb.amazonaws.com:6777/v3/site-activity?${params.toString()}`;
    
    console.log('Making request to:', url);

    // Function to make API request with timeout
    const makeRequest = async (attemptNum: number): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout

      try {
        console.log(`Attempt ${attemptNum}: Fetching data...`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'e_api_key': apiKey,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(`Attempt ${attemptNum}: Received status ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Attempt ${attemptNum}: API Error:`, errorText);
          
          // Retry on 504 Gateway Timeout
          if (response.status === 504 && attemptNum === 1) {
            console.log('Retrying due to 504 error...');
            return makeRequest(2);
          }
          
          return new Response(JSON.stringify({ 
            error: `API request failed: ${response.status} ${response.statusText}`,
            details: errorText
          }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const data = await response.json();
        console.log('API Response data summary:', {
          code: data.code,
          status: data.status,
          totalSites: data.data?.summary?.totalSites,
          attempt: attemptNum
        });

        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error(`Attempt ${attemptNum}: Request timeout after 50 seconds`);
          
          // Retry on timeout (only once)
          if (attemptNum === 1) {
            console.log('Retrying due to timeout...');
            return makeRequest(2);
          }
          
          return new Response(JSON.stringify({ 
            error: 'Request timeout: The external API took too long to respond after retrying' 
          }), {
            status: 504,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw fetchError;
      }
    };

    // Start with first attempt
    return await makeRequest(1);

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