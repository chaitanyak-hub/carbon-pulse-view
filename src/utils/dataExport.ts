import * as XLSX from 'xlsx';
import { SiteData } from '@/services/api';

const getAllFields = (site: SiteData) => ({
  'Site ID': site.siteId,
  'Agent Name': site.agent_name,
  'Site Address': site.siteAddress,
  'Date of Call': site.onboard_date,
  'Contact First Name': site.contact_first_name,
  'Contact Last Name': site.contact_last_name,
  'Contact Email': site.contact_email,
  'Contact Phone': site.contact_phone,
  'Contact UUID': site.contact_uuid,
  'Dialler Contact ID': site.dialler_contact_id,
  'Lead ID': site.lead_id,
  'Source UUID': site.source_uuid,
  'Dialler Username': site.dialler_username,
  'Site Status': site.site_status,
  'Consent': site.consent,
  'Consent Method': site.consent_type,
  'Consent Updated': site.consent_updated_date,
  'Shared': site.is_shared,
  'Share Count': site.share_count,
  'Last Shared Date': site.last_shared_date,
  'Has Appointment': site.has_appointment,
  'Appointment Date': site.appointment_date,
  'Appointment Time From': site.appointment_time_from,
  'Appointment Time To': site.appointment_time_to,
  'Appointment Set Date': site.appointment_set_date,
  'Appointment ID': site.appointment_id,
  'Appointment Status': site.appointment_status,
  'Sales Status': site.sales_status,
  'Rep Name': [site.rep_first_name, site.rep_last_name].filter(Boolean).join(' ') || null,
  'Rep Email': site.rep_email_id,
  'Rep ID': site.rep_id,
  'Property Type': site.property_type,
  'Premise Type': site.premise_type,
  'Bedrooms': site.no_of_bedrooms,
  'Floor Area (m²)': site.floor_area,
  'Floor Count': site.floor_count,
  'Decade of Build': site.decade_of_build,
  'Roof Type': site.roof_type,
  'Listed Grade': site.listed_grade,
  'Heating Source': site.heating_source,
  'Hot Water Source': site.hot_water_source,
  'Cooking Source': site.cooking_source,
  'EPC Available': site.epc_available,
  'EPC Address': site.epc_address,
  'Current EPC Rating': site.current_epc_rating,
  'Potential EPC Rating': site.potential_epc_rating,
  'Annual Elec (kWh)': site.annual_elec_consumption,
  'Annual Gas (kWh)': site.annual_gas_consumption,
  'Elec Unit Rate': site.elec_unit_rate,
  'Gas Unit Rate': site.gas_unit_rate,
  'Solar Panels': site.solar_panel_count,
  'Panel Capacity (W)': site.panel_capacity,
  'Potential Savings (£)': site.potential_savings,
  'Energy Savings (kWh)': site.potential_energy_savings,
  'Carbon Savings (kg)': site.potential_carbon_savings,
  'Latitude': site.latitude,
  'Longitude': site.longitude,
  'Last Login': site.last_login_time,
  'Login Count': site.login_count,
  'Deleted Date': site.deleted_date,
});

// Convert site data to CSV format
export const exportToCSV = (sites: SiteData[], filename: string = 'site-data') => {
  const allData = sites.map(getAllFields);
  const headers = Object.keys(allData[0] || {});

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...allData.map(row => headers.map(h => `"${row[h as keyof typeof row] ?? ''}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Convert site data to Excel format
export const exportToExcel = (sites: SiteData[], filename: string = 'site-data') => {
  const allData = sites.map(getAllFields);
  const worksheet = XLSX.utils.json_to_sheet(allData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Site Data');

  // Auto-size columns based on headers
  const headers = Object.keys(allData[0] || {});
  worksheet['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 2, 14) }));

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Generate filename with current date and filters
export const generateFilename = (baseFilename: string = 'site-data') => {
  const date = new Date().toISOString().split('T')[0];
  return `${baseFilename}-${date}`;
};
