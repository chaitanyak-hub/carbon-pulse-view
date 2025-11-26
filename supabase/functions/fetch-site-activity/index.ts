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

    // Function to fetch a single batch with retry logic
    const fetchBatch = async (offset: number, attemptNum: number = 1): Promise<any> => {
      const batchParams = new URLSearchParams(params);
      batchParams.set('limit', '200');
      batchParams.set('offset', String(offset));
      
      const url = `http://domestic-prod-alb-terra-1678302567.eu-west-1.elb.amazonaws.com:6777/v3/site-activity?${batchParams.toString()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout per batch

      try {
        console.log(`Batch at offset ${offset}, Attempt ${attemptNum}: Fetching...`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'e_api_key': apiKey,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Batch ${offset}, Attempt ${attemptNum}: API Error:`, errorText);
          
          // Retry on 504
          if (response.status === 504 && attemptNum === 1) {
            console.log(`Retrying batch ${offset}...`);
            return fetchBatch(offset, 2);
          }
          
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Batch ${offset} completed:`, {
          sites: data.data?.sites?.length || 0,
          totalSites: data.data?.summary?.totalSites
        });
        
        return data;

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error(`Batch ${offset}, Attempt ${attemptNum}: Timeout after 60s`);
          
          // Retry on timeout
          if (attemptNum === 1) {
            console.log(`Retrying batch ${offset} due to timeout...`);
            return fetchBatch(offset, 2);
          }
          
          throw new Error(`Batch ${offset} timeout after retry`);
        }
        
        throw fetchError;
      }
    };

    // Fetch first batch to get total count
    console.log('Fetching first batch to determine total...');
    const firstBatch = await fetchBatch(0);
    
    const totalSites = firstBatch.data?.summary?.totalSites || 0;
    const allSites = [...(firstBatch.data?.sites || [])];
    
    console.log(`Total sites to fetch: ${totalSites}, first batch returned: ${allSites.length}`);
    
    // Calculate remaining batches needed
    const batchSize = 200;
    const remainingBatches: number[] = [];
    
    for (let offset = batchSize; offset < totalSites; offset += batchSize) {
      remainingBatches.push(offset);
    }
    
    console.log(`Need to fetch ${remainingBatches.length} more batches`);
    
    // Track failed batches
    const failedBatches: number[] = [];
    
    // Fetch remaining batches in parallel (max 2 at a time)
    const maxConcurrent = 2;
    for (let i = 0; i < remainingBatches.length; i += maxConcurrent) {
      const currentBatch = remainingBatches.slice(i, i + maxConcurrent);
      const batchPromises = currentBatch.map(offset => 
        fetchBatch(offset).catch(error => {
          console.error(`Failed to fetch batch at offset ${offset}:`, error.message);
          failedBatches.push(offset);
          return null;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result?.data?.sites) {
          allSites.push(...result.data.sites);
        }
      });
      
      console.log(`Progress: ${allSites.length}/${totalSites} sites fetched (${failedBatches.length} batches failed)`);
    }
    
    console.log(`Fetching complete: ${allSites.length} total sites retrieved${failedBatches.length > 0 ? ` (${failedBatches.length} batches failed)` : ''}`);
    
    // Return aggregated response with warning if some batches failed
    const response = {
      code: firstBatch.code,
      status: firstBatch.status,
      data: {
        summary: {
          ...firstBatch.data?.summary,
          totalSites: allSites.length,
          ...(failedBatches.length > 0 && {
            warning: `${failedBatches.length} batches failed to load due to API timeouts. Showing ${allSites.length} of ${totalSites} sites.`
          })
        },
        pagination: {
          limit: totalSites,
          offset: 0,
          total: allSites.length
        },
        sites: allSites
      }
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
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