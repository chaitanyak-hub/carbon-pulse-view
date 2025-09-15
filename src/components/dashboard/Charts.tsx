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
import { SiteData } from '@/services/api';
import { Users } from 'lucide-react';

interface ChartsProps {
  sites: SiteData[];
  isLoading?: boolean;
}

const Charts = ({ sites, isLoading = false }: ChartsProps) => {
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
      if (site.has_appointment === true || site.has_appointment === 'true' || site.has_appointment === 'YES' || site.has_appointment === 1) {
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
        </div>
      </div>
    </div>
  );
};

export default Charts;