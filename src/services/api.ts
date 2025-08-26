// Site Activity API Service
const API_BASE_URL = 'https://api.thelabrador.co.uk/carbon/v3';
const API_KEY = 'b3cd497e-8a28-4148-987d-c3c2157bc740';

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
  const params = new URLSearchParams({
    from: filters.from,
    to: filters.to,
    format: filters.format || 'json'
  });

  if (filters.agentEmail) {
    params.append('agentEmail', filters.agentEmail);
  }

  const response = await fetch(`${API_BASE_URL}/site-activity?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'api_key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Helper functions for data analysis
export const calculateKPIs = (sites: SiteData[]) => {
  const totalSites = sites.length;
  const activeSites = sites.filter(site => site.site_status === 'active').length;
  const inactiveSites = totalSites - activeSites;
  
  const consentGranted = sites.filter(site => site.consent === 'YES').length;
  const consentPending = sites.filter(site => site.consent === 'NO').length;
  const consentRate = totalSites > 0 ? (consentGranted / totalSites) * 100 : 0;
  
  const sharedSites = sites.filter(site => site.is_shared).length;
  const shareRate = totalSites > 0 ? (sharedSites / totalSites) * 100 : 0;
  
  const sitesWithAppointments = sites.filter(site => site.has_appointment).length;
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