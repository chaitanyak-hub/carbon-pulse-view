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

  const filteredSites = sites.filter(site =>
    site.siteAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.siteId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h3 className="text-lg font-semibold text-card-foreground">Site Details</h3>
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
              <TableHead>Agent</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Consent</TableHead>
              <TableHead>Onboard Date</TableHead>
              <TableHead>Appointment</TableHead>
              <TableHead>Shares</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map((site, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{site.siteId}</TableCell>
                <TableCell>{site.agent_name}</TableCell>
                <TableCell className="max-w-xs truncate" title={site.siteAddress}>
                  {site.siteAddress}
                </TableCell>
                <TableCell>{getStatusBadge(site.site_status)}</TableCell>
                <TableCell>{getConsentBadge(site.consent)}</TableCell>
                <TableCell>{new Date(site.onboard_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {site.has_appointment ? (
                    <Badge variant="outline" className="text-primary border-primary">
                      {site.appointment_date ? new Date(site.appointment_date).toLocaleDateString() : 'Scheduled'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      None
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {site.share_count}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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