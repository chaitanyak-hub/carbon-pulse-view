import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { SiteData, SiteActivityFilters } from '@/services/api';
import AgentPerformanceOverTime from './AgentPerformanceOverTime';
import { Users, Globe, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { exportToExcel, generateFilename } from '@/utils/dataExport';
import { useToast } from '@/hooks/use-toast';

interface ChartsProps {
  sites: SiteData[];
  filters: SiteActivityFilters;
  isLoading?: boolean;
  webSites?: SiteData[];
}

const Charts = ({ sites, filters, isLoading = false, webSites = [] }: ChartsProps) => {
  const { toast } = useToast();
  // Function to format agent names
  const formatAgentName = (email: string) => {
    if (!email) return '';
    // Extract the part before @ and replace dots with spaces, then capitalize
    const namePart = email.split('@')[0];
    return namePart.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
  };

  // Calculate Agent Metrics
  const calculateAgentMetrics = () => {
    console.log('Sites data in calculateAgentMetrics:', sites);
    console.log('Sites length:', sites?.length);
    console.log('Sample site:', sites?.[0]);
    
    if (!sites || sites.length === 0) {
      console.log('No sites data available');
      return [];
    }

    const agentStats = sites.reduce((acc, site) => {
      const agent = site.agent_name;
      console.log('Processing agent:', agent, 'from site:', site.siteId);
      
      if (!agent) {
        console.log('No agent name found for site:', site.siteId);
        return acc;
      }
      
      // All agents are now included in the metrics
      
      if (!acc[agent]) {
        acc[agent] = {
          name: formatAgentName(agent),
          sitesAdded: 0,
          sitesShared: 0,
          appointmentsBooked: 0
        };
      }
      
      acc[agent].sitesAdded++;
      if (site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1) {
        acc[agent].sitesShared++;
      }
      if (site.appointment_time_from !== null && site.appointment_time_from !== '') {
        acc[agent].appointmentsBooked++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const result = Object.values(agentStats);
    console.log('Agent stats result:', result);
    return result;
  };

  const agentData = calculateAgentMetrics();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => {
            const entryName = entry.name || entry.dataKey || 'Value';
            const entryValue = entry.value;
            
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entryName}: {entryValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-6 rounded-lg animate-pulse">
              <div className="h-64 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Debug: Log the agent data to help identify issues
  console.log('Agent data for charts:', agentData);

  if (agentData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Agent Performance Metrics</h3>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground">No agent data available to display charts.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Agent Performance Metrics</h3>
        </div>
        
        {/* Web Leads (PROJECTSOLAR_WEB) */}
        <Card className="p-6 border-l-4 border-l-primary bg-accent/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <h4 className="text-lg font-semibold text-foreground">Web Leads</h4>
              <span className="text-sm text-muted-foreground">(PROJECTSOLAR_WEB — not included in overall numbers)</span>
            </div>
            <Button
              onClick={() => {
                if (webSites.length === 0) return;
                try {
                  const filename = generateFilename('web-leads');
                  exportToExcel(webSites, filename);
                  toast({ title: "Export Successful", description: `Downloaded ${webSites.length} web leads as ${filename}.xlsx` });
                } catch {
                  toast({ title: "Export Failed", description: "Failed to export web leads.", variant: "destructive" });
                }
              }}
              disabled={webSites.length === 0}
              size="sm"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel
            </Button>
          </div>
          <p className="text-3xl font-bold text-foreground mb-4">{webSites.length}</p>
          
          {webSites.length > 0 && (
            <div className="max-h-[400px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/80 hover:bg-muted/80">
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Site ID</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Address</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Customer Name</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Email</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Phone</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Date Added</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Status</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Consent</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Shared</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Appointment</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Property Type</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Bedrooms</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">EPC Rating</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Elec (kWh)</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Gas (kWh)</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Solar Panels</TableHead>
                    <TableHead className="sticky top-0 bg-muted font-semibold text-foreground whitespace-nowrap">Potential Savings (£)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webSites
                    .sort((a, b) => new Date(b.onboard_date).getTime() - new Date(a.onboard_date).getTime())
                    .map((site, index) => {
                      const customerName = [site.contact_first_name, site.contact_last_name]
                        .filter(Boolean)
                        .join(' ') || site.contact_name || '—';
                      
                      let dateAdded = '—';
                      try {
                        dateAdded = site.onboard_date ? format(parseISO(site.onboard_date), 'dd MMM yyyy, HH:mm') : '—';
                      } catch { /* ignore */ }

                      let apptInfo = '—';
                      if (site.appointment_date) {
                        try {
                          apptInfo = format(parseISO(site.appointment_date), 'dd MMM yyyy');
                          if (site.appointment_status) apptInfo += ` (${site.appointment_status})`;
                        } catch { apptInfo = site.appointment_date; }
                      }

                      return (
                        <TableRow key={`${site.siteId}-${index}`}>
                          <TableCell className="text-sm font-mono">{site.siteId || '—'}</TableCell>
                          <TableCell className="text-sm">{site.siteAddress || '—'}</TableCell>
                          <TableCell className="text-sm">{customerName}</TableCell>
                          <TableCell className="text-sm">{site.contact_email || '—'}</TableCell>
                          <TableCell className="text-sm">{site.contact_phone || '—'}</TableCell>
                          <TableCell className="text-sm">{dateAdded}</TableCell>
                          <TableCell className="text-sm">{site.site_status || '—'}</TableCell>
                          <TableCell className="text-sm">{site.consent || '—'}</TableCell>
                          <TableCell className="text-sm">{site.is_shared ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="text-sm">{apptInfo}</TableCell>
                          <TableCell className="text-sm">{site.property_type || '—'}</TableCell>
                          <TableCell className="text-sm">{site.no_of_bedrooms ?? '—'}</TableCell>
                          <TableCell className="text-sm">{site.current_epc_rating || '—'}</TableCell>
                          <TableCell className="text-sm">{site.annual_elec_consumption ?? '—'}</TableCell>
                          <TableCell className="text-sm">{site.annual_gas_consumption ?? '—'}</TableCell>
                          <TableCell className="text-sm">{site.solar_panel_count ?? '—'}</TableCell>
                          <TableCell className="text-sm">{site.potential_savings ?? '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <div className="space-y-8">
          {/* Combined Agent Performance Metrics */}
          <Card className="p-8">
            <h4 className="text-xl font-semibold mb-6 text-foreground">Agent Performance Overview</h4>
            <div className="w-full h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={agentData.sort((a: any, b: any) => b.sitesAdded - a.sitesAdded)} 
                  margin={{ top: 30, right: 30, left: 30, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--foreground))"
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))" 
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="sitesAdded" 
                    fill="hsl(220, 100%, 60%)" 
                    name="Sites Added" 
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList 
                      dataKey="sitesAdded" 
                      position="top" 
                      className="fill-foreground text-xs font-semibold" 
                      offset={8}
                    />
                  </Bar>
                  <Bar 
                    dataKey="sitesShared" 
                    fill="hsl(220, 100%, 45%)" 
                    name="Sites Shared" 
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList 
                      dataKey="sitesShared" 
                      position="top" 
                      className="fill-foreground text-xs font-semibold" 
                      offset={8}
                    />
                  </Bar>
                  <Bar 
                    dataKey="appointmentsBooked" 
                    fill="hsl(220, 100%, 30%)" 
                    name="Appointments Booked" 
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList 
                      dataKey="appointmentsBooked" 
                      position="top" 
                      className="fill-foreground text-xs font-semibold" 
                      offset={8}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Agent Performance Over Time */}
          <AgentPerformanceOverTime 
            sites={sites} 
            filters={filters}
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
};

export default Charts;