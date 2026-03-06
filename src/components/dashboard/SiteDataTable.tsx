import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import { SiteData } from '@/services/api';

interface SiteDataTableProps {
  sites: SiteData[];
  isLoading?: boolean;
}

const SiteDataTable = ({ sites, isLoading = false }: SiteDataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSites = sites.filter(site => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (site.siteAddress && site.siteAddress.toLowerCase().includes(searchLower)) ||
      (site.agent_name && site.agent_name.toLowerCase().includes(searchLower)) ||
      (site.siteId && site.siteId.toLowerCase().includes(searchLower)) ||
      (site.contact_first_name && site.contact_first_name.toLowerCase().includes(searchLower)) ||
      (site.contact_last_name && site.contact_last_name.toLowerCase().includes(searchLower)) ||
      (site.contact_email && site.contact_email.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'default' : 'secondary';
    return (
      <Badge variant={variant} className={status === 'active' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
        {status}
      </Badge>
    );
  };

  const getConsentBadge = (consent: string) => {
    const colors = {
      'YES': 'bg-success text-success-foreground',
      'NO': 'bg-destructive text-destructive-foreground',
      'PENDING': 'bg-warning text-warning-foreground'
    };
    return (
      <Badge className={colors[consent as keyof typeof colors] || 'bg-muted text-muted-foreground'}>
        {consent}
      </Badge>
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <Card className="dashboard-card">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Complete Raw Data View - All API Response Fields</h3>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Identifiers */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Site ID</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Agent Name</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Site Address</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Date of Call</TableHead>
              {/* Contact Details */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Contact First Name</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Contact Last Name</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Contact Email</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Contact Phone</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Contact UUID</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Dialler Contact ID</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Lead ID</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Source UUID</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Dialler Username</TableHead>
              {/* Status & Consent */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Site Status</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Consent</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Consent Method</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Consent Updated</TableHead>
              {/* Sharing */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Shared</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Share Count</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Last Shared Date</TableHead>
              {/* Appointments */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Has Appointment</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Appointment Date</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Appointment Time</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Appointment Set Date</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Appointment ID</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Appointment Status</TableHead>
              {/* Sales/Rep */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Sales Status</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Rep Name</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Rep Email</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Rep ID</TableHead>
              {/* Property */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Property Type</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Premise Type</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Bedrooms</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Floor Area (m²)</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Floor Count</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Decade of Build</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Roof Type</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Listed Grade</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Heating Source</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Hot Water Source</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Cooking Source</TableHead>
              {/* EPC */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">EPC Available</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">EPC Address</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Current EPC</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Potential EPC</TableHead>
              {/* Energy */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Annual Elec (kWh)</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Annual Gas (kWh)</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Elec Unit Rate</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Gas Unit Rate</TableHead>
              {/* Solar */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Solar Panels</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Panel Capacity (W)</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Potential Savings (£)</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Energy Savings (kWh)</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Carbon Savings (kg)</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Lat/Long</TableHead>
              {/* Other */}
              <TableHead className="font-bold text-foreground whitespace-nowrap">Last Login</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Login Count</TableHead>
              <TableHead className="font-bold text-foreground whitespace-nowrap">Deleted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map((site, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                {/* Identifiers */}
                <TableCell className="font-mono text-sm whitespace-nowrap">{site.siteId}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{site.agent_name}</TableCell>
                <TableCell className="max-w-xs truncate whitespace-nowrap" title={site.siteAddress}>{site.siteAddress}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{formatDate(site.onboard_date)}</TableCell>
                {/* Contact */}
                <TableCell className="whitespace-nowrap">{site.contact_first_name || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.contact_last_name || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{site.contact_email || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{site.contact_phone || 'N/A'}</TableCell>
                <TableCell className="font-mono text-xs whitespace-nowrap">{site.contact_uuid || 'N/A'}</TableCell>
                <TableCell className="font-mono text-xs whitespace-nowrap">{site.dialler_contact_id || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{site.lead_id || 'N/A'}</TableCell>
                <TableCell className="font-mono text-xs whitespace-nowrap">{site.source_uuid === 'null' ? 'N/A' : (site.source_uuid || 'N/A')}</TableCell>
                <TableCell className="whitespace-nowrap">{site.dialler_username === 'null' ? 'N/A' : (site.dialler_username || 'N/A')}</TableCell>
                {/* Status & Consent */}
                <TableCell>{getStatusBadge(site.site_status)}</TableCell>
                <TableCell>{getConsentBadge(site.consent)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={site.consent_type ? 'text-primary' : 'text-muted-foreground'}>
                    {site.consent_type || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{formatDate(site.consent_updated_date)}</TableCell>
                {/* Sharing */}
                <TableCell>
                  <Badge variant={site.is_shared === 'YES' || site.is_shared === true ? "default" : "secondary"} 
                         className={site.is_shared === 'YES' || site.is_shared === true ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                    {site.is_shared === 'YES' || site.is_shared === true ? 'YES' : 'NO'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono">{site.share_count ?? 0}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{formatDate(site.last_shared_date)}</TableCell>
                {/* Appointments */}
                <TableCell>
                  <Badge variant={site.has_appointment === 'YES' || site.has_appointment === true ? "default" : "secondary"} 
                         className={site.has_appointment === 'YES' || site.has_appointment === true ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                    {site.has_appointment === 'YES' || site.has_appointment === true ? 'YES' : 'NO'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{formatDate(site.appointment_date)}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">
                  {site.appointment_time_from && site.appointment_time_to 
                    ? `${site.appointment_time_from} - ${site.appointment_time_to}` 
                    : 'N/A'}
                </TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{formatDate(site.appointment_set_date)}</TableCell>
                <TableCell className="font-mono text-xs whitespace-nowrap">{site.appointment_id || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.appointment_status || 'N/A'}</TableCell>
                {/* Sales/Rep */}
                <TableCell className="whitespace-nowrap">
                  {site.sales_status ? (
                    <Badge variant="outline" className="text-primary">{site.sales_status}</Badge>
                  ) : 'N/A'}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {site.rep_first_name || site.rep_last_name 
                    ? `${site.rep_first_name || ''} ${site.rep_last_name || ''}`.trim() 
                    : 'N/A'}
                </TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{site.rep_email_id || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{site.rep_id || 'N/A'}</TableCell>
                {/* Property */}
                <TableCell className="whitespace-nowrap">{site.property_type || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.premise_type || 'N/A'}</TableCell>
                <TableCell className="text-center">{site.no_of_bedrooms ?? 'N/A'}</TableCell>
                <TableCell className="text-center">{site.floor_area ?? 'N/A'}</TableCell>
                <TableCell className="text-center">{site.floor_count || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.decade_of_build || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.roof_type || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.listed_grade || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.heating_source || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.hot_water_source || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">{site.cooking_source || 'N/A'}</TableCell>
                {/* EPC */}
                <TableCell>
                  <Badge variant={site.epc_available ? "default" : "secondary"} 
                         className={site.epc_available ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                    {site.epc_available ? 'YES' : 'NO'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate whitespace-nowrap" title={site.epc_address || ''}>{site.epc_address || 'N/A'}</TableCell>
                <TableCell className="text-center font-bold">{site.current_epc_rating || 'N/A'}</TableCell>
                <TableCell className="text-center font-bold">{site.potential_epc_rating || 'N/A'}</TableCell>
                {/* Energy */}
                <TableCell className="font-mono text-sm text-center">{site.annual_elec_consumption ?? 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm text-center">{site.annual_gas_consumption ?? 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm text-center">{site.elec_unit_rate ?? 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm text-center">{site.gas_unit_rate ?? 'N/A'}</TableCell>
                {/* Solar */}
                <TableCell className="text-center">{site.solar_panel_count ?? 'N/A'}</TableCell>
                <TableCell className="text-center">{site.panel_capacity ?? 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm text-center">{site.potential_savings != null ? `£${site.potential_savings.toLocaleString()}` : 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm text-center">{site.potential_energy_savings?.toLocaleString() ?? 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm text-center">{site.potential_carbon_savings?.toLocaleString() ?? 'N/A'}</TableCell>
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {site.latitude && site.longitude ? `${site.latitude}, ${site.longitude}` : 'N/A'}
                </TableCell>
                {/* Other */}
                <TableCell className="font-mono text-sm whitespace-nowrap">{formatDateTime(site.last_login_time)}</TableCell>
                <TableCell className="text-center">{site.login_count ?? 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm whitespace-nowrap">{formatDate(site.deleted_date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">Raw Data Summary:</h4>
          <button 
            onClick={() => {
              const dataStr = JSON.stringify(sites, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'site_data.json';
              link.click();
            }}
            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
          >
            Export JSON
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Records:</span>
            <span className="ml-2 font-mono">{sites.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Filtered:</span>
            <span className="ml-2 font-mono">{filteredSites.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Unique Agents:</span>
            <span className="ml-2 font-mono">{new Set(sites.map(s => s.agent_name)).size}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Date Range:</span>
            <span className="ml-2 font-mono text-xs">
              {sites.length > 0 && (
                <>
                  {new Date(Math.min(...sites.map(s => new Date(s.onboard_date).getTime()))).toLocaleDateString()} - 
                  {new Date(Math.max(...sites.map(s => new Date(s.onboard_date).getTime()))).toLocaleDateString()}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No sites found matching your search.</p>
        </div>
      )}
    </Card>
  );
};

export default SiteDataTable;
