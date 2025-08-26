import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { SiteData } from '@/services/api';
import { AlertTriangle, TrendingUp, Users, Clock, Calendar, Target } from 'lucide-react';

interface ChartsProps {
  sites: SiteData[];
  isLoading?: boolean;
}

const Charts = ({ sites, isLoading = false }: ChartsProps) => {
  // 1. Customer Journey Funnel Analysis
  const calculateFunnelMetrics = () => {
    const totalSites = sites.length || 0;
    const consentsObtained = sites.filter(site => site.consent === 'YES').length || 0;
    const sitesShared = sites.filter(site => 
      site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1
    ).length || 0;
    const appointmentsBooked = sites.filter(site => 
      site.has_appointment === true || site.has_appointment === 'true' || site.has_appointment === 'YES' || site.has_appointment === 1
    ).length || 0;
    
    const consentRate = totalSites > 0 ? (consentsObtained / totalSites) * 100 : 0;
    const shareRate = consentsObtained > 0 ? (sitesShared / consentsObtained) * 100 : 0;
    const appointmentRate = sitesShared > 0 ? (appointmentsBooked / sitesShared) * 100 : 0;
    
    return [
      { stage: 'Sites Onboarded', count: totalSites, rate: 100, color: '#3b82f6', dropOff: 0 },
      { stage: 'Consents Obtained', count: consentsObtained, rate: isNaN(consentRate) ? 0 : consentRate, color: '#10b981', dropOff: Math.max(0, totalSites - consentsObtained) },
      { stage: 'Sites Shared', count: sitesShared, rate: isNaN(shareRate) ? 0 : shareRate, color: '#8b5cf6', dropOff: Math.max(0, consentsObtained - sitesShared) },
      { stage: 'Appointments Booked', count: appointmentsBooked, rate: isNaN(appointmentRate) ? 0 : appointmentRate, color: '#f59e0b', dropOff: Math.max(0, sitesShared - appointmentsBooked) }
    ];
  };

  // 2. Agent Productivity & Leaderboard
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

  // 3. Appointment Analysis & Trends
  const calculateAppointmentMetrics = () => {
    const appointmentSites = sites.filter(site => 
      site.has_appointment === true || site.has_appointment === 'true' || site.has_appointment === 'YES' || site.has_appointment === 1
    );
    const deletedAppointments = sites.filter(site => 
      site.deleted_date && (site.has_appointment === true || site.has_appointment === 'true' || site.has_appointment === 'YES' || site.has_appointment === 1)
    ).length;
    
    // Time distribution analysis
    const timeDistribution = appointmentSites.reduce((acc, site) => {
      if (site.appointment_time_from) {
        const hour = parseInt(site.appointment_time_from.split(':')[0]);
        const period = hour < 12 ? 'Morning (6-12)' : hour < 17 ? 'Afternoon (12-17)' : 'Evening (17-21)';
        acc[period] = (acc[period] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total: appointmentSites.length,
      cancelled: deletedAppointments,
      noShowRate: appointmentSites.length > 0 ? (deletedAppointments / appointmentSites.length) * 100 : 0,
      timeDistribution: Object.entries(timeDistribution).map(([period, count]) => ({
        period,
        count,
        percentage: (count / appointmentSites.length) * 100
      }))
    };
  };

  // 4. Exceptions & Quality Issues
  const calculateExceptions = () => {
    const onboardedNoConsent = sites.filter(site => site.consent === 'NO').length;
    const consentNoShare = sites.filter(site => 
      site.consent === 'YES' && !(site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1)
    ).length;
    const sharedNoAppointment = sites.filter(site => 
      (site.is_shared === true || site.is_shared === 'true' || site.is_shared === 'YES' || site.is_shared === 1) && 
      !(site.has_appointment === true || site.has_appointment === 'true' || site.has_appointment === 'YES' || site.has_appointment === 1)
    ).length;
    const inactiveSites = sites.filter(site => site.site_status === 'inactive').length;
    const multipleShares = sites.filter(site => site.share_count > 1).length;
    const deletedSites = sites.filter(site => site.deleted_date).length;

    return {
      onboardedNoConsent,
      consentNoShare, 
      sharedNoAppointment,
      inactiveSites,
      multipleShares,
      deletedSites,
      total: sites.length
    };
  };

  // 5. Daily Activity Trends (Last 30 Days)
  const calculateDailyTrends = () => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const daySites = sites.filter(site => site.onboard_date === dateStr);
      const dayAppointments = sites.filter(site => 
        site.appointment_set_date === dateStr || 
        (site.appointment_date === dateStr && (site.has_appointment === true || site.has_appointment === 'true' || site.has_appointment === 'YES' || site.has_appointment === 1))
      );
      
      last30Days.push({
        date: dayLabel,
        sitesOnboarded: daySites.length,
        appointmentsBooked: dayAppointments.length,
        conversionRate: daySites.length > 0 ? (dayAppointments.length / daySites.length) * 100 : 0
      });
    }
    
    return last30Days;
  };

  const funnelData = calculateFunnelMetrics();
  const agentData = calculateAgentMetrics();
  const appointmentMetrics = calculateAppointmentMetrics();
  const exceptions = calculateExceptions();
  const dailyTrends = calculateDailyTrends();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-card-foreground font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value % 1 !== 0 ? entry.value.toFixed(1) : entry.value}
              {entry.name.includes('Rate') || entry.name.includes('%') ? '%' : ''}
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
          {Array.from({ length: 6 }).map((_, index) => (
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
      {/* 1. CUSTOMER JOURNEY FUNNEL */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Customer Journey Funnel</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel Visualization */}
          <Card className="lg:col-span-2 p-6">
            <h4 className="text-lg font-medium mb-4">Conversion Pipeline</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Count">
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="count" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Drop-off Analysis */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Stage Analysis</h4>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <Badge variant="outline">{stage.rate.toFixed(1)}%</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${stage.rate}%`,
                        backgroundColor: stage.color
                      }}
                    />
                  </div>
                  {stage.dropOff > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Drop-off: {stage.dropOff} sites ({((stage.dropOff / (stage.count + stage.dropOff)) * 100).toFixed(1)}%)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 2. AGENT PERFORMANCE LEADERBOARD */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Agent Performance Leaderboard</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Rankings */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">End-to-End Performance</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="endToEndRate" fill="hsl(var(--primary))" name="End-to-End Rate">
                  <LabelList dataKey="endToEndRate" position="right" formatter={(value: number) => `${value}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Agent Activity Breakdown */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Activity Volume</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="sitesOnboarded" fill="#3b82f6" name="Sites Onboarded" />
                <Bar dataKey="consentsObtained" fill="#10b981" name="Consents" />
                <Bar dataKey="appointmentsBooked" fill="#f59e0b" name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* 3. APPOINTMENT ANALYTICS */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Appointment Analytics</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment Time Distribution */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Time Slot Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={appointmentMetrics.timeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ period, percentage }) => `${period}: ${percentage.toFixed(1)}%`}
                >
                  {appointmentMetrics.timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Appointment Quality Metrics */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Quality Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Total Appointments</span>
                <Badge variant="default">{appointmentMetrics.total}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Cancelled/No-Shows</span>
                <Badge variant="destructive">{appointmentMetrics.cancelled}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">No-Show Rate</span>
                <Badge variant={appointmentMetrics.noShowRate < 10 ? "default" : "destructive"}>
                  {appointmentMetrics.noShowRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </Card>

          {/* Daily Activity Trends */}
          <Card className="p-6">
            <h4 className="text-lg font-medium mb-4">Recent Trends (7 Days)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyTrends.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="sitesOnboarded" stroke="#3b82f6" strokeWidth={2} name="Sites Onboarded" />
                <Line type="monotone" dataKey="appointmentsBooked" stroke="#f59e0b" strokeWidth={2} name="Appointments" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* 4. EXCEPTIONS & QUALITY PANEL */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Exceptions & Quality Issues</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Alert className={exceptions.onboardedNoConsent > 0 ? "border-amber-200" : "border-green-200"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Onboarded → No Consent:</strong> {exceptions.onboardedNoConsent} sites
              <br />
              <span className="text-sm text-muted-foreground">
                {((exceptions.onboardedNoConsent / exceptions.total) * 100).toFixed(1)}% of total
              </span>
            </AlertDescription>
          </Alert>

          <Alert className={exceptions.consentNoShare > 0 ? "border-amber-200" : "border-green-200"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Consent → Not Shared:</strong> {exceptions.consentNoShare} sites
              <br />
              <span className="text-sm text-muted-foreground">
                Conversion blocker
              </span>
            </AlertDescription>
          </Alert>

          <Alert className={exceptions.sharedNoAppointment > 0 ? "border-amber-200" : "border-green-200"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Shared → No Appointment:</strong> {exceptions.sharedNoAppointment} sites
              <br />
              <span className="text-sm text-muted-foreground">
                Final stage bottleneck
              </span>
            </AlertDescription>
          </Alert>

          <Alert className={exceptions.inactiveSites > 0 ? "border-red-200" : "border-green-200"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Inactive Sites:</strong> {exceptions.inactiveSites} sites
              <br />
              <span className="text-sm text-muted-foreground">
                Requires attention
              </span>
            </AlertDescription>
          </Alert>

          <Alert className={exceptions.multipleShares > 0 ? "border-blue-200" : "border-green-200"}>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>Multiple Shares:</strong> {exceptions.multipleShares} sites
              <br />
              <span className="text-sm text-muted-foreground">
                High engagement sites
              </span>
            </AlertDescription>
          </Alert>

          <Alert className={exceptions.deletedSites > 0 ? "border-red-200" : "border-green-200"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Deleted Sites:</strong> {exceptions.deletedSites} sites
              <br />
              <span className="text-sm text-muted-foreground">
                Lost opportunities
              </span>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* 5. OPERATIONAL EFFICIENCY TRENDS */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Operational Efficiency (30-Day Trend)</h3>
        </div>

        <Card className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="sitesOnboarded" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Sites Onboarded"
              />
              <Area 
                type="monotone" 
                dataKey="appointmentsBooked" 
                stackId="2"
                stroke="#f59e0b" 
                fill="#f59e0b"
                fillOpacity={0.6}
                name="Appointments Booked"
              />
              <Line 
                type="monotone" 
                dataKey="conversionRate" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Daily Conversion %"
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Charts;