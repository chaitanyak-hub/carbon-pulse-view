import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SiteActivityFilters {
  from?: string;
  to?: string;
  agentEmail?: string;
  format?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LABRADOR_API_KEY');
    
    if (!apiKey) {
      console.error('LABRADOR_API_KEY not found in environment variables');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { filters }: { filters: SiteActivityFilters } = await req.json();
    
    console.log('=== API PROXY REQUEST ===');
    console.log('Filters received:', filters);

    // Build query parameters
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.agentEmail) params.append('agentEmail', filters.agentEmail);
    if (filters.format) params.append('format', filters.format);

    const url = `https://api.thelabrador.co.uk/carbon/v3/site-activity?${params.toString()}`;
    
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api_key': apiKey,
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
    console.log('API response received, data length:', data?.data?.length || 0);

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