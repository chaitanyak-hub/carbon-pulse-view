// Site Activity API Service via Supabase Edge Function
import { supabase } from '@/integrations/supabase/client';

export interface SiteActivityFilters {
  utmSource: string;
  from?: string;
  to?: string;
  siteType?: string;
  includeSiteDetails?: boolean;
  limit?: number;
  offset?: number;
  // Client-side only filters
  activeOnly?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface SiteData {
  agent_name: string;
  contact_name: string | null;
  siteId: string;
  siteAddress: string;
  onboard_date: string;
  // Contact details
  contact_uuid: string | null;
  dialler_contact_id: string | null;
  lead_id: string | null;
  source_uuid: string | null;
  dialler_username: string | null;
  contact_email: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_phone: string | null;
  // Consent
  consent: 'YES' | 'NO' | 'PENDING';
  consent_type: 'VERBAL' | 'DIGITAL' | 'EMAIL' | null;
  consent_updated_date: string | null;
  // Status & sharing
  is_shared: boolean | string | number;
  site_status: 'ACTIVE' | 'INACTIVE';
  share_count: number | null;
  last_shared_date: string | null;
  deleted_date: string | null;
  last_login_time: string | null;
  login_count: number | null;
  // Appointments
  has_appointment: boolean | string | number;
  appointment_date: string | null;
  appointment_time_from: string | null;
  appointment_time_to: string | null;
  appointment_set_date: string | null;
  appointment_id: string | null;
  appointment_status: string | null;
  // Sales/Rep
  rep_email_id: string | null;
  rep_first_name: string | null;
  rep_last_name: string | null;
  rep_id: string | null;
  sales_status: string | null;
  // Property details
  heating_source: string | null;
  hot_water_source: string | null;
  cooking_source: string | null;
  no_of_bedrooms: number | null;
  property_type: string | null;
  floor_area: number | null;
  decade_of_build: string | null;
  premise_type: string | null;
  floor_count: string | number | null;
  listed_grade: string | null;
  roof_type: string | null;
  // EPC
  epc_available: boolean | null;
  epc_address: string | null;
  current_epc_rating: string | null;
  potential_epc_rating: string | null;
  // Energy
  elecMeter: Record<string, any> | null;
  gasMeter: Record<string, any> | null;
  annual_elec_consumption: number | null;
  annual_gas_consumption: number | null;
  elec_unit_rate: number | null;
  gas_unit_rate: number | null;
  // Solar
  solar_panel_count: number | null;
  panel_capacity: number | null;
  latitude: string | null;
  longitude: string | null;
  installation_life_span_years: number | null;
  potential_energy_savings: number | null;
  potential_savings: number | null;
  potential_carbon_savings: number | null;
  recommendations: any[] | null;
}

export interface SiteActivityResponse {
  code: number;
  status: string;
  data: {
    summary: {
      totalSites: number;
      returnedSites: number;
      dateRange: {
        from: string;
        to: string;
      };
      filters: {
        utmSource: string;
        includeSiteDetails: boolean;
      };
    };
    pagination: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    sites: SiteData[];
  };
}

export const fetchSiteActivity = async (filters: SiteActivityFilters): Promise<SiteActivityResponse> => {
  console.log('=== API REQUEST DEBUG ===');
  console.log('Calling Supabase Edge Function with filters:', filters);

  // Prepare API filters (exclude client-side only filters)
  const apiFilters: any = {
    utmSource: filters.utmSource,
    siteType: filters.siteType,
    includeSiteDetails: filters.includeSiteDetails,
    limit: filters.limit,
    offset: filters.offset,
  };
  
  // Only include from/to if provided
  if (filters.from) {
    apiFilters.from = filters.from;
  }
  if (filters.to) {
    apiFilters.to = filters.to;
  }

  try {
    const { data, error } = await supabase.functions.invoke('fetch-site-activity', {
      body: { filters: apiFilters }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`Edge Function Error: ${error.message}`);
    }

    console.log('Edge Function response received, data length:', data?.data?.sites?.length || 0);
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Helper functions for data analysis
export const calculateKPIs = (sites: SiteData[]) => {
  console.log('=== KPI CALCULATION DEBUG ===');
  console.log('Total sites:', sites.length);
  console.log('Sample site data:', sites[0]);
  
  const totalSites = sites.length;
  const activeSites = sites.filter(site => site.site_status === 'ACTIVE').length;
  const inactiveSites = totalSites - activeSites;
  
  const consentGranted = sites.filter(site => site.consent === 'YES').length;
  const consentPending = sites.filter(site => site.consent === 'NO').length;
  const consentRate = totalSites > 0 ? (consentGranted / totalSites) * 100 : 0;
  
  // Debug the is_shared field
  console.log('is_shared values:', sites.slice(0, 5).map(s => ({ id: s.siteId, is_shared: s.is_shared, type: typeof s.is_shared })));
  
  const sharedSites = sites.filter(site => 
    site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1
  ).length;
  const shareRate = totalSites > 0 ? (sharedSites / totalSites) * 100 : 0;
  
  // Debug the has_appointment field  
  console.log('has_appointment values:', sites.slice(0, 5).map(s => ({ id: s.siteId, has_appointment: s.has_appointment, type: typeof s.has_appointment })));
  
  const sitesWithAppointments = sites.filter(site => 
    site.appointment_time_from !== null && site.appointment_time_from !== ''
  ).length;
  const appointmentRate = totalSites > 0 ? (sitesWithAppointments / totalSites) * 100 : 0;
  
  // Split metrics by consent status
  const sitesWithConsent = sites.filter(site => site.consent === 'YES');
  const sitesWithoutConsent = sites.filter(site => site.consent !== 'YES');
  
  const appointmentsWithConsent = sitesWithConsent.filter(site => 
    site.appointment_time_from !== null && site.appointment_time_from !== ''
  ).length;
  
  const appointmentsWithoutConsent = sitesWithoutConsent.filter(site => 
    site.appointment_time_from !== null && site.appointment_time_from !== ''
  ).length;
  
  const sharedSitesWithConsent = sitesWithConsent.filter(site => 
    site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1
  ).length;
  
  const sharedSitesWithoutConsent = sitesWithoutConsent.filter(site => 
    site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1
  ).length;
  
  const appointmentRateWithConsent = sitesWithConsent.length > 0 ? (appointmentsWithConsent / sitesWithConsent.length) * 100 : 0;
  const appointmentRateWithoutConsent = sitesWithoutConsent.length > 0 ? (appointmentsWithoutConsent / sitesWithoutConsent.length) * 100 : 0;
  
  const result = {
    totalSites: totalSites || 0,
    activeSites: activeSites || 0,
    inactiveSites: inactiveSites || 0,
    consentGranted: consentGranted || 0,
    consentPending: consentPending || 0,
    consentRate: isNaN(consentRate) ? 0 : consentRate,
    sharedSites: sharedSites || 0,
    shareRate: isNaN(shareRate) ? 0 : shareRate,
    sitesWithAppointments: sitesWithAppointments || 0,
    appointmentRate: isNaN(appointmentRate) ? 0 : appointmentRate,
    appointmentRateWithConsent: isNaN(appointmentRateWithConsent) ? 0 : appointmentRateWithConsent,
    appointmentRateWithoutConsent: isNaN(appointmentRateWithoutConsent) ? 0 : appointmentRateWithoutConsent,
    appointmentsWithConsent: appointmentsWithConsent || 0,
    appointmentsWithoutConsent: appointmentsWithoutConsent || 0,
    sitesWithConsentCount: sitesWithConsent.length || 0,
    sitesWithoutConsentCount: sitesWithoutConsent.length || 0,
    sharedSitesWithConsent: sharedSitesWithConsent || 0,
    sharedSitesWithoutConsent: sharedSitesWithoutConsent || 0
  };
  
  console.log('KPI Results:', result);
  return result;
};