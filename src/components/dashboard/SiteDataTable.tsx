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
      (site.siteId && site.siteId.toLowerCase().includes(searchLower))
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
            placeholder="Search sites..."
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
              <TableHead>Site ID</TableHead>
              <TableHead>Agent Name</TableHead>
              <TableHead>Site Address</TableHead>
              <TableHead>Date of Call</TableHead>
              <TableHead>Site Status</TableHead>
              <TableHead>Consent Provided by Customer</TableHead>
              <TableHead>Consent Method</TableHead>
              <TableHead>Consent Last Updated</TableHead>
              <TableHead>Has Site Been Shared with Customer</TableHead>
              <TableHead>Share Count</TableHead>
              <TableHead>Last Shared Date</TableHead>
              <TableHead>Appointment Booked with Customer</TableHead>
              <TableHead>Appointment Date</TableHead>
              <TableHead>Appointment Time</TableHead>
              <TableHead>Appointment Booking Date</TableHead>
              <TableHead>Deleted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map((site, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-mono text-sm">{site.siteId}</TableCell>
                <TableCell className="font-medium">{site.agent_name}</TableCell>
                <TableCell className="max-w-xs truncate" title={site.siteAddress}>
                  {site.siteAddress}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {site.onboard_date ? new Date(site.onboard_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>{getStatusBadge(site.site_status)}</TableCell>
                <TableCell>{getConsentBadge(site.consent)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={site.consent_type ? 'text-primary' : 'text-muted-foreground'}>
                    {site.consent_type || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {site.consent_updated_date ? new Date(site.consent_updated_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={site.is_shared ? "default" : "secondary"} 
                         className={site.is_shared ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                    {site.is_shared ? 'YES' : 'NO'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono">
                    {site.share_count}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {site.last_shared_date ? new Date(site.last_shared_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={site.has_appointment ? "default" : "secondary"} 
                         className={site.has_appointment ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                    {site.has_appointment ? 'YES' : 'NO'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {site.appointment_date ? new Date(site.appointment_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {site.appointment_time_from && site.appointment_time_to 
                    ? `${site.appointment_time_from} - ${site.appointment_time_to}` 
                    : 'N/A'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {site.appointment_set_date ? new Date(site.appointment_set_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {site.deleted_date ? new Date(site.deleted_date).toLocaleDateString() : 'N/A'}
                </TableCell>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
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
        
        <div className="border-t border-border pt-3">
          <h5 className="font-medium text-xs mb-2 text-muted-foreground">Available Data Fields for Charts:</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="font-medium text-primary">Identifiers:</span>
              <div className="ml-2 text-muted-foreground">
                • siteId<br/>
                • agent_name<br/>
                • siteAddress
              </div>
            </div>
            <div>
              <span className="font-medium text-primary">Status & Consent:</span>
              <div className="ml-2 text-muted-foreground">
                • site_status (active/inactive)<br/>
                • consent (YES/NO)<br/>
                • consent_type (VERBAL/DIGITAL)<br/>
                • consent_updated_date
              </div>
            </div>
            <div>
              <span className="font-medium text-primary">Dates:</span>
              <div className="ml-2 text-muted-foreground">
                • onboard_date<br/>
                • appointment_date<br/>
                • appointment_set_date<br/>
                • last_shared_date<br/>
                • deleted_date
              </div>
            </div>
            <div>
              <span className="font-medium text-primary">Sharing:</span>
              <div className="ml-2 text-muted-foreground">
                • is_shared (boolean)<br/>
                • share_count (number)<br/>
                • last_shared_date
              </div>
            </div>
            <div>
              <span className="font-medium text-primary">Appointments:</span>
              <div className="ml-2 text-muted-foreground">
                • has_appointment (boolean)<br/>
                • appointment_time_from<br/>
                • appointment_time_to<br/>
                • appointment_set_date
              </div>
            </div>
            <div>
              <span className="font-medium text-primary">Metrics Possible:</span>
              <div className="ml-2 text-muted-foreground">
                • Conversion rates<br/>
                • Time-based trends<br/>
                • Agent performance<br/>
                • Funnel analysis
              </div>
            </div>
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