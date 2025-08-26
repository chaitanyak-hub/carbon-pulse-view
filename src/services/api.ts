// Site Activity API Service via Supabase Edge Function
import { supabase } from '@/integrations/supabase/client';

export interface SiteActivityFilters {
  from: string;
  to: string;
  agentEmail?: string;
  format?: 'json' | 'csv';
}

export interface SiteData {
  agent_name: string;
  siteId: string;
  siteAddress: string;
  onboard_date: string;
  consent: 'YES' | 'NO' | 'PENDING';
  consent_type: 'VERBAL' | 'DIGITAL' | null;
  is_shared: boolean;
  site_status: 'active' | 'inactive';
  has_appointment: boolean;
  appointment_date: string | null;
  appointment_time_from: string | null;
  appointment_time_to: string | null;
  appointment_set_date: string | null;
  share_count: number;
  last_shared_date: string | null;
  deleted_date: string | null;
  consent_updated_date: string | null;
}

export interface SiteActivityResponse {
  code: number;
  status: string;
  data: {
    summary: {
      totalSites: number;
      dateRange: {
        from: string;
        to: string;
      };
      agentFilter?: string;
    };
    sites: SiteData[];
  };
}

export const fetchSiteActivity = async (filters: SiteActivityFilters): Promise<SiteActivityResponse> => {
  console.log('=== API REQUEST DEBUG ===');
  console.log('Calling Supabase Edge Function with filters:', filters);

  try {
    const { data, error } = await supabase.functions.invoke('fetch-site-activity', {
      body: { filters }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`Edge Function Error: ${error.message}`);
    }

    console.log('Edge Function response received, data length:', data?.data?.sites?.length || 0);
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error; // Don't return mock data, let the error propagate
  }
};

// Helper functions for data analysis
export const calculateKPIs = (sites: SiteData[]) => {
  const totalSites = sites.length;
  const activeSites = sites.filter(site => site.site_status === 'active').length;
  const inactiveSites = totalSites - activeSites;
  
  const consentGranted = sites.filter(site => site.consent === 'YES').length;
  const consentPending = sites.filter(site => site.consent === 'NO').length;
  const consentRate = totalSites > 0 ? (consentGranted / totalSites) * 100 : 0;
  
  const sharedSites = sites.filter(site => site.is_shared === true).length;
  const shareRate = totalSites > 0 ? (sharedSites / totalSites) * 100 : 0;
  
  const sitesWithAppointments = sites.filter(site => site.has_appointment === true).length;
  const appointmentRate = totalSites > 0 ? (sitesWithAppointments / totalSites) * 100 : 0;
  
  return {
    totalSites,
    activeSites,
    inactiveSites,
    consentGranted,
    consentPending,
    consentRate,
    sharedSites,
    shareRate,
    sitesWithAppointments,
    appointmentRate
  };
};