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
      
      if (!acc[agent]) {
        acc[agent] = {
          name: agent,
          sitesAdded: 0,
          consentsObtained: 0,
          appointmentsBooked: 0
        };
      }
      
      acc[agent].sitesAdded++;
      if (site.consent === 'YES') acc[agent].consentsObtained++;
      if (site.has_appointment === true || site.has_appointment === 'true' || site.has_appointment === 'YES' || site.has_appointment === 1) {
        acc[agent].appointmentsBooked++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const result = Object.values(agentStats).sort((a: any, b: any) => b.sitesAdded - a.sitesAdded);
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
          {/* Sites Added by Agent */}
          <Card className="p-8">
            <h4 className="text-xl font-semibold mb-6 text-foreground">Sites Added by Agent</h4>
            <div className="w-full h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={agentData} 
                  layout="horizontal" 
                  margin={{ top: 30, right: 80, left: 300, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--foreground))"
                    tick={{ fontSize: 14, fontWeight: 500 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--foreground))" 
                    width={300}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    interval={0}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="sitesAdded" 
                    fill="hsl(var(--primary))" 
                    name="Sites Added" 
                    radius={[0, 6, 6, 0]}
                  >
                    <LabelList 
                      dataKey="sitesAdded" 
                      position="right" 
                      className="fill-foreground text-sm font-semibold" 
                      offset={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Consents by Agent */}
          <Card className="p-8">
            <h4 className="text-xl font-semibold mb-6 text-foreground">Consents Obtained by Agent</h4>
            <div className="w-full h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={agentData} 
                  layout="horizontal" 
                  margin={{ top: 30, right: 80, left: 300, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--foreground))"
                    tick={{ fontSize: 14, fontWeight: 500 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--foreground))" 
                    width={300}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    interval={0}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="consentsObtained" 
                    fill="hsl(var(--chart-2))" 
                    name="Consents Obtained" 
                    radius={[0, 6, 6, 0]}
                  >
                    <LabelList 
                      dataKey="consentsObtained" 
                      position="right" 
                      className="fill-foreground text-sm font-semibold" 
                      offset={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Appointments Booked by Agent */}
          <Card className="p-8">
            <h4 className="text-xl font-semibold mb-6 text-foreground">Appointments Booked by Agent</h4>
            <div className="w-full h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={agentData} 
                  layout="horizontal" 
                  margin={{ top: 30, right: 80, left: 300, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--foreground))"
                    tick={{ fontSize: 14, fontWeight: 500 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--foreground))" 
                    width={300}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    interval={0}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="appointmentsBooked" 
                    fill="hsl(var(--chart-3))" 
                    name="Appointments Booked" 
                    radius={[0, 6, 6, 0]}
                  >
                    <LabelList 
                      dataKey="appointmentsBooked" 
                      position="right" 
                      className="fill-foreground text-sm font-semibold" 
                      offset={12}
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