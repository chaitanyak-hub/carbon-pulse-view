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

  const url = `${API_BASE_URL}/site-activity?${params}`;
  console.log('=== API REQUEST DEBUG ===');
  console.log('Fetching from URL:', url);
  console.log('Headers:', { 'Content-Type': 'application/json', 'api_key': API_KEY });
  console.log('Filters:', filters);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api_key': API_KEY,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    // CORS workaround - return mock data for development
    console.log('Returning mock data due to CORS issue');
    return {
      code: 200,
      status: "Success",
      data: {
        summary: {
          totalSites: 2,
          dateRange: {
            from: filters.from,
            to: filters.to
          },
          agentFilter: filters.agentEmail
        },
        sites: [
          {
            agent_name: "Chaitanya K",
            siteId: "SITE#12345",
            siteAddress: "10 Downing Street, London, UK",
            onboard_date: "2025-07-15",
            consent: "YES" as const,
            consent_type: "VERBAL" as const,
            is_shared: true,
            site_status: "active" as const,
            has_appointment: true,
            appointment_date: "2025-08-15",
            appointment_time_from: "10:00",
            appointment_time_to: "11:00",
            appointment_set_date: "2025-07-20",
            share_count: 3,
            last_shared_date: "2025-07-25",
            deleted_date: null,
            consent_updated_date: "2025-07-10"
          },
          {
            agent_name: "Chaitanya K",
            siteId: "SITE#67890",
            siteAddress: "221B Baker Street, London, UK",
            onboard_date: "2025-07-20",
            consent: "NO" as const,
            consent_type: null,
            is_shared: false,
            site_status: "inactive" as const,
            has_appointment: false,
            appointment_date: null,
            appointment_time_from: null,
            appointment_time_to: null,
            appointment_set_date: null,
            share_count: 0,
            last_shared_date: null,
            deleted_date: null,
            consent_updated_date: null
          }
        ]
      }
    };
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