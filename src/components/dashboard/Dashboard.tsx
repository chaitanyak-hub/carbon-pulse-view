import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3 } from 'lucide-react';
import DashboardFilters from './DashboardFilters';
import KPICards from './KPICards';
import Charts from './Charts';
import SiteDataTable from './SiteDataTable';
import DataExport from './DataExport';
import { fetchSiteActivity, calculateKPIs, SiteActivityFilters, SiteData } from '@/services/api';
import dashboardHero from '@/assets/dashboard-hero.jpg';

const Dashboard = () => {
  const [filters, setFilters] = useState<SiteActivityFilters>({
    utmSource: 'PROJECTSOLAR',
    siteType: 'domestic',
    activeOnly: true,
    includeSiteDetails: true,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['siteActivity', filters.utmSource, filters.from, filters.to, filters.siteType],
    queryFn: async () => {
      // Fetch all data with a single request using high limit
      const response = await fetchSiteActivity({
        ...filters,
        includeSiteDetails: true,
        limit: 5000,
        offset: 0,
      });

      const allSites = response?.data?.sites || [];

      // Return data in the same structure as the API
      return {
        ...response,
        data: {
          summary: response?.data?.summary || {
            totalSites: allSites.length,
            returnedSites: allSites.length,
            dateRange: {
              from: filters.from || '',
              to: filters.to || '',
            },
            filters: {
              utmSource: filters.utmSource,
              includeSiteDetails: true,
            },
          },
          sites: allSites,
        },
      };
    },
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

  const allSites = data?.data?.sites || [];
  
  // Apply filters client-side
  let sites = allSites;
  
  if (filters.activeOnly) {
    sites = sites.filter(site => site.site_status === 'ACTIVE');
  }

  // Filter out sites from agents with perse or digitalapi in their email, and only show projectsolar agents
  sites = sites.filter(site => {
    if (!site.agent_name) return false;
    const agentEmail = site.agent_name.toLowerCase();
    return !agentEmail.includes('perse') && 
           !agentEmail.includes('digitalapi') && 
           agentEmail.includes('projectsolar');
  });

  // Remove duplicate addresses, keeping the most recent (by onboard_date)
  const addressMap = new Map<string, SiteData>();
  sites.forEach(site => {
    if (!site.siteAddress) return;
    
    const normalizedAddress = site.siteAddress.trim().toUpperCase();
    const existingSite = addressMap.get(normalizedAddress);
    
    if (!existingSite) {
      addressMap.set(normalizedAddress, site);
    } else {
      // Keep the site with the most recent onboard_date
      const existingDate = new Date(existingSite.onboard_date).getTime();
      const currentDate = new Date(site.onboard_date).getTime();
      
      if (currentDate > existingDate) {
        addressMap.set(normalizedAddress, site);
      }
    }
  });
  
  sites = Array.from(addressMap.values());

  const kpiData = calculateKPIs(sites);
  const summary = data?.data?.summary;

  return (
    <div className="min-h-screen bg-white">
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
        {/* Filters Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <div className="w-1 h-6 bg-primary mr-3 rounded"></div>
            Filter Controls
          </h2>
          <DashboardFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            isLoading={isLoading}
          />
        </div>

        {error && (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        {/* Data Summary Section */}
        {summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
              <div className="w-1 h-6 bg-primary mr-3 rounded"></div>
              Data Summary
            </h2>
            <Card className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">Current Dataset</h3>
                  <p className="text-muted-foreground">
                    Showing {summary.totalSites} sites from Project Solar domestic properties
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Last updated</p>
                  <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* KPI Overview Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <div className="w-1 h-6 bg-primary mr-3 rounded"></div>
            Key Performance Indicators
          </h2>
          <KPICards data={kpiData} isLoading={isLoading} />
        </div>

        {/* Business Intelligence Charts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <div className="w-1 h-6 bg-primary mr-3 rounded"></div>
            Business Intelligence Charts
          </h2>
          <Charts sites={sites} filters={filters} isLoading={isLoading} />
        </div>

        {/* Raw Data Analysis Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <div className="w-1 h-6 bg-primary mr-3 rounded"></div>
            Raw Data Analysis
          </h2>
          
          {/* Data Export Section */}
          <div className="mb-6">
            <DataExport sites={sites} isLoading={isLoading} />
          </div>

          <SiteDataTable sites={sites} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;