import { Card } from '@/components/ui/card';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Share2, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity 
} from 'lucide-react';

interface KPIData {
  totalSites: number;
  activeSites: number;
  inactiveSites: number;
  consentGranted: number;
  consentPending: number;
  consentRate: number;
  sharedSites: number;
  shareRate: number;
  sitesWithAppointments: number;
  appointmentRate: number;
}

interface KPICardsProps {
  data: KPIData;
  isLoading?: boolean;
}

const KPICards = ({ data, isLoading = false }: KPICardsProps) => {
  const kpiCards = [
    {
      title: 'Total Sites',
      value: data.totalSites,
      icon: Building2,
      gradient: 'gradient-primary',
      textColor: 'text-white'
    },
    {
      title: 'Active Sites',
      value: data.activeSites,
      percentage: data.totalSites > 0 ? (data.activeSites / data.totalSites) * 100 : 0,
      icon: TrendingUp,
      gradient: 'gradient-success',
      textColor: 'text-white'
    },
    {
      title: 'Inactive Sites',
      value: data.inactiveSites,
      percentage: data.totalSites > 0 ? (data.inactiveSites / data.totalSites) * 100 : 0,
      icon: TrendingDown,
      gradient: 'gradient-warning',
      textColor: 'text-white'
    },
    {
      title: 'Consent Rate',
      value: `${data.consentRate.toFixed(1)}%`,
      subtitle: `${data.consentGranted} granted`,
      icon: CheckCircle,
      gradient: data.consentRate >= 70 ? 'gradient-success' : 'gradient-warning',
      textColor: 'text-white'
    },
    {
      title: 'Share Rate',
      value: `${data.shareRate.toFixed(1)}%`,
      subtitle: `${data.sharedSites} shared`,
      icon: Share2,
      gradient: 'gradient-primary',
      textColor: 'text-white'
    },
    {
      title: 'Appointment Rate',
      value: `${data.appointmentRate.toFixed(1)}%`,
      subtitle: `${data.sitesWithAppointments} scheduled`,
      icon: Calendar,
      gradient: data.appointmentRate >= 50 ? 'gradient-success' : 'gradient-warning',
      textColor: 'text-white'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="dashboard-card animate-pulse">
            <div className="h-24 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {kpiCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className={`dashboard-card ${card.gradient} ${card.textColor} hover:shadow-glow transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-90 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold mb-1">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs opacity-75">
                    {card.subtitle}
                  </p>
                )}
                {card.percentage !== undefined && (
                  <p className="text-xs opacity-75">
                    {card.percentage.toFixed(1)}% of total
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <IconComponent className="h-8 w-8 opacity-80" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default KPICards;