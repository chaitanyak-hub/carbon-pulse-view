import * as XLSX from 'xlsx';
import { SiteData } from '@/services/api';

// Convert site data to CSV format
export const exportToCSV = (sites: SiteData[], filename: string = 'site-data') => {
  const headers = [
    'Agent Name',
    'Site ID',
    'Site Address',
    'Onboard Date',
    'Consent',
    'Consent Type',
    'Is Shared',
    'Site Status',
    'Has Appointment',
    'Appointment Date',
    'Appointment Time From',
    'Appointment Time To',
    'Appointment Set Date',
    'Share Count',
    'Last Shared Date',
    'Deleted Date',
    'Consent Updated Date'
  ];

  const csvData = sites.map(site => [
    site.agent_name,
    site.siteId,
    site.siteAddress,
    site.onboard_date,
    site.consent,
    site.consent_type,
    site.is_shared,
    site.site_status,
    site.has_appointment,
    site.appointment_date,
    site.appointment_time_from,
    site.appointment_time_to,
    site.appointment_set_date,
    site.share_count,
    site.last_shared_date,
    site.deleted_date,
    site.consent_updated_date
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field || ''}"`).join(','))
    .join('\n');

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
  const worksheet = XLSX.utils.json_to_sheet(
    sites.map(site => ({
      'Agent Name': site.agent_name,
      'Site ID': site.siteId,
      'Site Address': site.siteAddress,
      'Onboard Date': site.onboard_date,
      'Consent': site.consent,
      'Consent Type': site.consent_type,
      'Is Shared': site.is_shared,
      'Site Status': site.site_status,
      'Has Appointment': site.has_appointment,
      'Appointment Date': site.appointment_date,
      'Appointment Time From': site.appointment_time_from,
      'Appointment Time To': site.appointment_time_to,
      'Appointment Set Date': site.appointment_set_date,
      'Share Count': site.share_count,
      'Last Shared Date': site.last_shared_date,
      'Deleted Date': site.deleted_date,
      'Consent Updated Date': site.consent_updated_date
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Site Data');

  // Auto-size columns
  const columnWidths = [
    { wch: 25 }, // Agent Name
    { wch: 15 }, // Site ID
    { wch: 30 }, // Site Address
    { wch: 12 }, // Onboard Date
    { wch: 10 }, // Consent
    { wch: 12 }, // Consent Type
    { wch: 10 }, // Is Shared
    { wch: 12 }, // Site Status
    { wch: 15 }, // Has Appointment
    { wch: 15 }, // Appointment Date
    { wch: 18 }, // Appointment Time From
    { wch: 16 }, // Appointment Time To
    { wch: 18 }, // Appointment Set Date
    { wch: 12 }, // Share Count
    { wch: 16 }, // Last Shared Date
    { wch: 14 }, // Deleted Date
    { wch: 18 }  // Consent Updated Date
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Generate filename with current date and filters
export const generateFilename = (baseFilename: string = 'site-data') => {
  const date = new Date().toISOString().split('T')[0];
  return `${baseFilename}-${date}`;
};