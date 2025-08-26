import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList
} from 'recharts';
import { SiteData } from '@/services/api';
import { Users } from 'lucide-react';

interface ChartsProps {
  sites: SiteData[];
  isLoading?: boolean;
}

const Charts = ({ sites, isLoading = false }: ChartsProps) => {
  // Agent Productivity & Leaderboard
  const calculateAgentMetrics = () => {
    const agentStats = sites.reduce((acc, site) => {
      const agent = site.agent_name;
      if (!acc[agent]) {
        acc[agent] = {
          name: agent,
          sitesOnboarded: 0,
          consentsObtained: 0,
          sitesShared: 0,
          appointmentsBooked: 0,
          activeSites: 0
        };
      }
      
      acc[agent].sitesOnboarded++;
      if (site.consent === 'YES') acc[agent].consentsObtained++;
      if (site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1) acc[agent].sitesShared++;
      if (site.has_appointment === true || site.has_appointment === 'true' || site.has_appointment === 'YES' || site.has_appointment === 1) acc[agent].appointmentsBooked++;
      if (site.site_status === 'active') acc[agent].activeSites++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(agentStats).map((agent: any) => {
      const consentRate = agent.sitesOnboarded > 0 ? (agent.consentsObtained / agent.sitesOnboarded) * 100 : 0;
      const shareRate = agent.consentsObtained > 0 ? (agent.sitesShared / agent.consentsObtained) * 100 : 0;
      const appointmentRate = agent.sitesShared > 0 ? (agent.appointmentsBooked / agent.sitesShared) * 100 : 0;
      const endToEndRate = agent.sitesOnboarded > 0 ? (agent.appointmentsBooked / agent.sitesOnboarded) * 100 : 0;
      
      return {
        ...agent,
        consentRate: isNaN(consentRate) ? 0 : Math.round(consentRate),
        shareRate: isNaN(shareRate) ? 0 : Math.round(shareRate),
        appointmentRate: isNaN(appointmentRate) ? 0 : Math.round(appointmentRate),
        endToEndRate: isNaN(endToEndRate) ? 0 : Math.round(endToEndRate)
      };
    }).sort((a, b) => (b.endToEndRate || 0) - (a.endToEndRate || 0));
  };

  const agentData = calculateAgentMetrics();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => {
            const entryName = entry.name || entry.dataKey || 'Value';
            const entryValue = typeof entry.value === 'number' && entry.value % 1 !== 0 ? entry.value.toFixed(1) : entry.value;
            const shouldShowPercent = typeof entryName === 'string' && (entryName.toLowerCase().includes('rate') || entryName.toLowerCase().includes('%'));
            
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entryName}: {entryValue}{shouldShowPercent ? '%' : ''}
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

  return (
    <div className="space-y-8">
      {/* AGENT PERFORMANCE LEADERBOARD */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Agent Performance Leaderboard</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* End-to-End Performance */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">End-to-End Performance (%)</h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={agentData.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="endToEndRate" fill="hsl(var(--primary))" name="End-to-End Rate" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="endToEndRate" position="right" formatter={(value: number) => `${value}%`} className="fill-foreground text-xs font-medium" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Sites Onboarded by Agent */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Sites Onboarded by Agent</h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={agentData.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sitesOnboarded" fill="#3b82f6" name="Sites Onboarded" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="sitesOnboarded" position="right" className="fill-foreground text-xs font-medium" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Conversion Rates Comparison */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Conversion Rates Comparison (%)</h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={agentData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="consentRate" fill="#10b981" name="Consent Rate" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="consentRate" position="top" formatter={(value: number) => `${value}%`} className="fill-foreground text-xs font-medium" />
                </Bar>
                <Bar dataKey="shareRate" fill="#8b5cf6" name="Share Rate" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="shareRate" position="top" formatter={(value: number) => `${value}%`} className="fill-foreground text-xs font-medium" />
                </Bar>
                <Bar dataKey="appointmentRate" fill="#f59e0b" name="Appointment Rate" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="appointmentRate" position="top" formatter={(value: number) => `${value}%`} className="fill-foreground text-xs font-medium" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Activity Volume Breakdown */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Activity Volume by Agent</h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={agentData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="consentsObtained" fill="#10b981" name="Consents" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="consentsObtained" position="top" className="fill-foreground text-xs font-medium" />
                </Bar>
                <Bar dataKey="sitesShared" fill="#8b5cf6" name="Sites Shared" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="sitesShared" position="top" className="fill-foreground text-xs font-medium" />
                </Bar>
                <Bar dataKey="appointmentsBooked" fill="#f59e0b" name="Appointments" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="appointmentsBooked" position="top" className="fill-foreground text-xs font-medium" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Charts;