import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { SiteData, SiteActivityFilters } from '@/services/api';
import { TrendingUp } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, isWithinInterval, parseISO } from 'date-fns';

interface AgentPerformanceOverTimeProps {
  sites: SiteData[];
  filters: SiteActivityFilters;
  isLoading?: boolean;
}

const AgentPerformanceOverTime = ({ sites, filters, isLoading = false }: AgentPerformanceOverTimeProps) => {
  const [showConsentOnly, setShowConsentOnly] = useState(false);

  // Function to format agent names
  const formatAgentName = (email: string) => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    return namePart.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
  };

  // Generate color for each agent
  const generateAgentColor = (index: number, variant: 'sites' | 'appointments') => {
    const hues = [220, 270, 320, 170, 40, 190, 290, 340, 120, 60];
    const hue = hues[index % hues.length];
    const saturation = variant === 'sites' ? 70 : 50;
    const lightness = variant === 'sites' ? 55 : 45;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Calculate weekly performance data
  const calculateWeeklyPerformance = () => {
    if (!sites || sites.length === 0) return [];

    // Filter sites based on consent toggle
    let filteredSites = sites;
    if (showConsentOnly) {
      filteredSites = sites.filter(site => 
        site.consent === 'YES'
      );
    }

    // Filter by date range if provided
    if (filters.fromDate || filters.toDate) {
      filteredSites = filteredSites.filter(site => {
        const siteDate = parseISO(site.onboard_date);
        let withinRange = true;

        if (filters.fromDate) {
          const fromDate = parseISO(filters.fromDate);
          withinRange = withinRange && siteDate >= fromDate;
        }

        if (filters.toDate) {
          const toDate = parseISO(filters.toDate);
          withinRange = withinRange && siteDate <= toDate;
        }

        return withinRange;
      });
    }

    if (filteredSites.length === 0) return [];

    // Get date range
    const startDate = filters.fromDate ? parseISO(filters.fromDate) : parseISO(filteredSites[0].onboard_date);
    const endDate = filters.toDate ? parseISO(filters.toDate) : parseISO(filteredSites[filteredSites.length - 1].onboard_date);

    // Generate weeks (Monday to Sunday)
    const weeks = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 } // Monday
    );

    // Get unique agents
    const agents = [...new Set(filteredSites.map(site => site.agent_name).filter(Boolean))];

    // Calculate weekly data
    const weeklyData = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekLabel = `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`;

      const weekData: any = {
        week: weekLabel,
        fullWeekStart: weekStart,
      };

      agents.forEach(agent => {
        const agentName = formatAgentName(agent);
        const weekSites = filteredSites.filter(site => {
          const siteDate = parseISO(site.onboard_date);
          return site.agent_name === agent && 
                 isWithinInterval(siteDate, { start: weekStart, end: weekEnd });
        });

        weekData[`${agentName}_sites`] = weekSites.length;
        weekData[`${agentName}_appointments`] = weekSites.filter(site => 
          site.has_appointment === true || 
          site.has_appointment === 'true' || 
          site.has_appointment === 'YES' || 
          site.has_appointment === 1
        ).length;
      });

      return weekData;
    });

    // Calculate cumulative data
    const cumulativeData = weeklyData.map((week, index) => {
      const cumulativeWeek: any = { ...week };
      
      // Calculate total cumulative numbers across all agents
      let totalCumulativeSites = 0;
      let totalCumulativeAppointments = 0;
      
      // Sum up all previous weeks including current week
      for (let i = 0; i <= index; i++) {
        agents.forEach(agent => {
          const agentName = formatAgentName(agent);
          totalCumulativeSites += weeklyData[i][`${agentName}_sites`] || 0;
          totalCumulativeAppointments += weeklyData[i][`${agentName}_appointments`] || 0;
        });
      }
      
      cumulativeWeek.totalCumulativeSites = totalCumulativeSites;
      cumulativeWeek.totalCumulativeAppointments = totalCumulativeAppointments;
      
      return cumulativeWeek;
    });

    return { weeklyData, cumulativeData, agents: agents.map(formatAgentName) };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium mb-2">{label}</p>
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
      <Card className="p-6 rounded-lg animate-pulse">
        <div className="h-96 bg-muted rounded"></div>
      </Card>
    );
  }

  const performanceData = calculateWeeklyPerformance();
  
  if (!performanceData || !Array.isArray(performanceData) && performanceData.weeklyData?.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h4 className="text-xl font-semibold text-foreground">Agent Performance Over Time</h4>
        </div>
        <p className="text-muted-foreground">No data available for the selected time period.</p>
      </Card>
    );
  }

  const { weeklyData, cumulativeData, agents } = Array.isArray(performanceData) ? { weeklyData: [], cumulativeData: [], agents: [] } : performanceData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h4 className="text-xl font-semibold text-foreground">Agent Performance Over Time</h4>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="consent-toggle"
            checked={showConsentOnly}
            onCheckedChange={setShowConsentOnly}
          />
          <Label htmlFor="consent-toggle" className="text-sm font-medium">
            Show Consent Only
          </Label>
        </div>
      </div>

      {/* Sites Added Chart */}
      <Card className="p-6">
        <h5 className="text-lg font-semibold text-foreground mb-4">Sites Added</h5>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={weeklyData} 
              margin={{ top: 20, right: 120, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 11, fontWeight: 500 }}
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
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              
              {agents.map((agent, index) => (
                <Line
                  key={`${agent}_sites`}
                  type="monotone"
                  dataKey={`${agent}_sites`}
                  stroke={generateAgentColor(index, 'sites')}
                  strokeWidth={3}
                  dot={{ fill: generateAgentColor(index, 'sites'), strokeWidth: 2, r: 4 }}
                  name={`${agent} Sites Added`}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Appointments Booked Chart */}
      <Card className="p-6">
        <h5 className="text-lg font-semibold text-foreground mb-4">Appointments Booked</h5>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={weeklyData} 
              margin={{ top: 20, right: 120, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 11, fontWeight: 500 }}
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
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              
              {agents.map((agent, index) => (
                <Line
                  key={`${agent}_appointments`}
                  type="monotone"
                  dataKey={`${agent}_appointments`}
                  stroke={generateAgentColor(index, 'appointments')}
                  strokeWidth={3}
                  dot={{ fill: generateAgentColor(index, 'appointments'), strokeWidth: 2, r: 4 }}
                  name={`${agent} App Booked`}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cumulative Sites Added Bar Chart */}
      <Card className="p-6">
        <h5 className="text-lg font-semibold text-foreground mb-4">Cumulative Sites Added (Week on Week)</h5>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={cumulativeData} 
              margin={{ top: 20, right: 120, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 11, fontWeight: 500 }}
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
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              
              <Bar
                dataKey="totalCumulativeSites"
                fill="hsl(var(--primary))"
                name="Total Sites Added"
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cumulative Appointments Booked Bar Chart */}
      <Card className="p-6">
        <h5 className="text-lg font-semibold text-foreground mb-4">Cumulative Appointments Booked (Week on Week)</h5>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={cumulativeData} 
              margin={{ top: 20, right: 120, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.7} />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 11, fontWeight: 500 }}
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
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              
              <Bar
                dataKey="totalCumulativeAppointments"
                fill="hsl(var(--secondary))"
                name="Total Appointments Booked"
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p>• Weekly data shown from Monday to Sunday</p>
        <p>• Cumulative charts show running totals week on week</p>
        {showConsentOnly && <p>• Filtered to show only sites with consent (YES)</p>}
      </div>
    </div>
  );
};

export default AgentPerformanceOverTime;