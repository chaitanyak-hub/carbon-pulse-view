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
    const agentStats = sites.reduce((acc, site) => {
      const agent = site.agent_name;
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

    return Object.values(agentStats).sort((a: any, b: any) => b.sitesAdded - a.sitesAdded);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sites Added by Agent */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Sites Added by Agent</h4>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={agentData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sitesAdded" fill="hsl(var(--primary))" name="Sites Added" radius={[0, 4, 4, 0]}>
                    <LabelList 
                      dataKey="sitesAdded" 
                      position="right" 
                      className="fill-foreground text-sm font-medium" 
                      offset={8}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Consents by Agent */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Consents Obtained by Agent</h4>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={agentData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="consentsObtained" fill="hsl(var(--success))" name="Consents Obtained" radius={[0, 4, 4, 0]}>
                    <LabelList 
                      dataKey="consentsObtained" 
                      position="right" 
                      className="fill-foreground text-sm font-medium" 
                      offset={8}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Appointments Booked by Agent */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Appointments Booked by Agent</h4>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={agentData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="appointmentsBooked" fill="hsl(var(--warning))" name="Appointments Booked" radius={[0, 4, 4, 0]}>
                    <LabelList 
                      dataKey="appointmentsBooked" 
                      position="right" 
                      className="fill-foreground text-sm font-medium" 
                      offset={8}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Appointments by Agent */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Appointments by Agent</h4>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={agentData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="appointmentsBooked" fill="hsl(var(--accent))" name="Appointments" radius={[0, 4, 4, 0]}>
                    <LabelList 
                      dataKey="appointmentsBooked" 
                      position="right" 
                      className="fill-foreground text-sm font-medium" 
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