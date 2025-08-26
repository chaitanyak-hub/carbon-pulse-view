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
  // Calculate end-to-end conversion rate
  const endToEndRate = data.totalSites > 0 ? (data.sitesWithAppointments / data.totalSites) * 100 : 0;
  
  const kpiCards = [
    {
      title: 'Sites Onboarded',
      value: data.totalSites,
      subtitle: 'Total pipeline entries',
      icon: Building2,
      gradient: 'from-primary to-primary/80',
      status: 'neutral'
    },
    {
      title: 'Consent Rate',
      value: `${data.consentRate.toFixed(1)}%`,
      subtitle: `${data.consentGranted} of ${data.totalSites} granted`,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      status: data.consentRate >= 75 ? 'good' : data.consentRate >= 60 ? 'warning' : 'poor',
      target: 75
    },
    {
      title: 'Sites Shared',
      value: `${data.shareRate.toFixed(1)}%`,
      subtitle: `${data.sharedSites} sites shared`,
      icon: Share2,
      gradient: 'from-blue-500 to-blue-600',
      status: data.shareRate >= 80 ? 'good' : data.shareRate >= 65 ? 'warning' : 'poor',
      target: 80
    },
    {
      title: 'Appointments Booked',
      value: `${data.appointmentRate.toFixed(1)}%`,
      subtitle: `${data.sitesWithAppointments} scheduled`,
      icon: Calendar,
      gradient: 'from-purple-500 to-purple-600',
      status: data.appointmentRate >= 60 ? 'good' : data.appointmentRate >= 45 ? 'warning' : 'poor',
      target: 60
    },
    {
      title: 'End-to-End Rate',
      value: `${endToEndRate.toFixed(1)}%`,
      subtitle: 'Onboard → Appointment',
      icon: TrendingUp,
      gradient: 'from-amber-500 to-amber-600',
      status: endToEndRate >= 35 ? 'good' : endToEndRate >= 25 ? 'warning' : 'poor',
      target: 35
    },
    {
      title: 'Active Sites',
      value: `${data.totalSites > 0 ? ((data.activeSites / data.totalSites) * 100).toFixed(1) : 0}%`,
      subtitle: `${data.activeSites} of ${data.totalSites} active`,
      icon: Activity,
      gradient: 'from-emerald-500 to-emerald-600',
      status: data.activeSites > data.inactiveSites ? 'good' : 'warning'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-blue-600 text-white p-6 rounded-lg animate-pulse">
            <div className="h-24 bg-blue-500 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'border-green-200 shadow-green-100';
      case 'warning': return 'border-amber-200 shadow-amber-100';
      case 'poor': return 'border-red-200 shadow-red-100';
      default: return 'border-primary/20 shadow-primary/10';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'good': return <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>;
      case 'warning': return <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>;
      case 'poor': return <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-primary/50"></div>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {kpiCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className={`relative overflow-hidden border-2 ${getStatusColor(card.status)} bg-gradient-to-br ${card.gradient} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <IconComponent className="w-full h-full" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-6 w-6" />
                  <span className="text-sm font-medium opacity-90">{card.title}</span>
                </div>
                {getStatusIndicator(card.status)}
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold tracking-tight">
                  {card.value}
                </div>
                
                <div className="text-sm opacity-80">
                  {card.subtitle}
                </div>
                
                {card.target && (
                  <div className="text-xs opacity-70 mt-2">
                    Target: {card.target}%
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default KPICards;