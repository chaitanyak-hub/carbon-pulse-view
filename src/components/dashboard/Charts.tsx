import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  LabelList
} from 'recharts';
import { SiteData } from '@/services/api';

interface ChartsProps {
  sites: SiteData[];
  isLoading?: boolean;
}

const Charts = ({ sites, isLoading = false }: ChartsProps) => {
  // Generate daily sites data from real API data
  const generateDailySitesFromReal = () => {
    const days = [];
    const now = new Date();
    const agents = [...new Set(sites.map(site => site.agent_name))];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = date.toISOString().split('T')[0];
      
      // Count sites added on this specific day from real data
      const sitesAddedThisDay = sites.filter(site => site.onboard_date === fullDate);
      const totalSitesAdded = sitesAddedThisDay.length;
      
      const agentData: any = {
        date: dayLabel,
        fullDate,
        totalSitesAdded
      };
      
      // Add individual agent data
      agents.forEach(agent => {
        const agentSites = sitesAddedThisDay.filter(site => site.agent_name === agent).length;
        agentData[agent.replace(' ', '_')] = agentSites;
      });
      
      days.push(agentData);
    }
    
    return days;
  };

  const dailySitesData = generateDailySitesFromReal();
  
  // Agent totals for the period from real data
  const agentTotals = sites.reduce((acc, site) => {
    acc[site.agent_name] = (acc[site.agent_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const agentData = Object.entries(agentTotals).map(([name, total]) => ({
    name,
    total,
    color: `hsl(var(--chart-${(Object.keys(agentTotals).indexOf(name) % 6) + 1}))`
  }));

  // Process data for charts from real API data
  const siteStatusData = [
    {
      name: 'Active',
      value: sites.filter(site => site.site_status === 'active').length,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Inactive',
      value: sites.filter(site => site.site_status === 'inactive').length,
      color: 'hsl(var(--chart-2))'
    }
  ];

  const consentData = [
    {
      name: 'Granted',
      value: sites.filter(site => site.consent === 'YES').length,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Pending/Denied',
      value: sites.filter(site => site.consent === 'NO').length,
      color: 'hsl(var(--chart-2))'
    }
  ];

  const appointmentData = [
    {
      name: 'With Appointments',
      value: sites.filter(site => site.has_appointment).length,
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Without Appointments',
      value: sites.filter(site => !site.has_appointment).length,
      color: 'hsl(var(--chart-2))'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
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
            <Card key={index} className="bg-blue-100 border border-blue-200 p-6 rounded-lg animate-pulse">
              <div className="h-64 bg-blue-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Daily Site Additions - Last 30 Days */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-blue-900">Daily Site Additions (Last 30 Days)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Total Sites Added */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Total Sites Added Per Day</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailySitesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="totalSitesAdded" 
                  fill="hsl(var(--chart-1))" 
                  name="Sites Added"
                >
                  <LabelList dataKey="totalSitesAdded" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Sites Added by Agent */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Sites Added by Agent (Total)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={agentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total Sites Added">
                  {agentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="total" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Current Status Distribution */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Site Status Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={siteStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {siteStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Consent Analysis */}
          <Card className="chart-container">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Consent Analysis</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={consentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {consentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Charts;