import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3 } from 'lucide-react';
import DashboardFilters from './DashboardFilters';
import KPICards from './KPICards';
import Charts from './Charts';
import SiteDataTable from './SiteDataTable';
import { fetchSiteActivity, calculateKPIs, SiteActivityFilters } from '@/services/api';
import dashboardHero from '@/assets/dashboard-hero.jpg';

const Dashboard = () => {
  const [filters, setFilters] = useState<SiteActivityFilters>({
    from: '2024-08-01',
    to: '2025-08-01',
    agentEmail: 'chaitanya+projectsolar@perse.energy',
    format: 'json'
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['siteActivity', filters],
    queryFn: () => fetchSiteActivity(filters),
    enabled: false, // Start with manual trigger
  });

  const handleFiltersChange = (newFilters: SiteActivityFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    refetch();
  };

  // Initial load
  useEffect(() => {
    refetch();
  }, [refetch]);

  const sites = data?.data?.sites || [];
  const kpiData = calculateKPIs(sites);
  const summary = data?.data?.summary;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={dashboardHero} 
          alt="Site Activity Dashboard" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-12 w-12 mr-3" />
              <h1 className="text-4xl font-bold">Site Activity Dashboard</h1>
            </div>
            <p className="text-xl opacity-90">Monitor and analyze your site performance with real-time insights</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          isLoading={isLoading}
        />

        {error && (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        {summary && (
          <Card className="dashboard-card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground mb-2">Summary</h2>
                <p className="text-muted-foreground">
                  Showing {summary.totalSites} sites from {summary.dateRange.from} to {summary.dateRange.to}
                  {summary.agentFilter && ` for agent: ${summary.agentFilter}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </Card>
        )}

        <KPICards data={kpiData} isLoading={isLoading} />

        <Charts sites={sites} isLoading={isLoading} />

        <SiteDataTable sites={sites} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Dashboard;