import * as XLSX from 'xlsx';
import { SiteData } from '@/services/api';

// Convert site data to CSV format
export const exportToCSV = (sites: SiteData[], filename: string = 'site-data') => {
  const headers = [
    'Agent Name',
    'Site ID',
    'Site Address',
    'Date of Call',
    'Consent Provided by Customer',
    'Consent Method',
    'Has Site Been Shared with Customer',
    'Site Status',
    'Appointment Booked with Customer',
    'Appointment Date',
    'Appointment Time From',
    'Appointment Time To',
    'Appointment Booking Date',
    'Share Count',
    'Last Shared Date',
    'Deleted Date',
    'Consent Last Updated'
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
      'Date of Call': site.onboard_date,
      'Consent Provided by Customer': site.consent,
      'Consent Method': site.consent_type,
      'Has Site Been Shared with Customer': site.is_shared,
      'Site Status': site.site_status,
      'Appointment Booked with Customer': site.has_appointment,
      'Appointment Date': site.appointment_date,
      'Appointment Time From': site.appointment_time_from,
      'Appointment Time To': site.appointment_time_to,
      'Appointment Booking Date': site.appointment_set_date,
      'Share Count': site.share_count,
      'Last Shared Date': site.last_shared_date,
      'Deleted Date': site.deleted_date,
      'Consent Last Updated': site.consent_updated_date
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Site Data');

  // Auto-size columns
  const columnWidths = [
    { wch: 25 }, // Agent Name
    { wch: 15 }, // Site ID
    { wch: 30 }, // Site Address
    { wch: 15 }, // Date of Call
    { wch: 30 }, // Consent Provided by Customer
    { wch: 15 }, // Consent Method
    { wch: 35 }, // Has Site Been Shared with Customer
    { wch: 12 }, // Site Status
    { wch: 35 }, // Appointment Booked with Customer
    { wch: 15 }, // Appointment Date
    { wch: 18 }, // Appointment Time From
    { wch: 16 }, // Appointment Time To
    { wch: 25 }, // Appointment Booking Date
    { wch: 12 }, // Share Count
    { wch: 16 }, // Last Shared Date
    { wch: 14 }, // Deleted Date
    { wch: 20 }  // Consent Last Updated
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Generate filename with current date and filters
export const generateFilename = (baseFilename: string = 'site-data') => {
  const date = new Date().toISOString().split('T')[0];
  return `${baseFilename}-${date}`;
};