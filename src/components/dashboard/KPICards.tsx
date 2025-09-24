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
  appointmentRateWithConsent: number;
  appointmentRateWithoutConsent: number;
  appointmentsWithConsent: number;
  appointmentsWithoutConsent: number;
  sitesWithConsentCount: number;
  sitesWithoutConsentCount: number;
  sharedSitesWithConsent: number;
  sharedSitesWithoutConsent: number;
}

interface KPICardsProps {
  data: KPIData;
  isLoading?: boolean;
}

const KPICards = ({ data, isLoading = false }: KPICardsProps) => {
  // Row 1: Total metrics
  const row1Cards = [
    {
      title: 'Total Sites Onboarded',
      value: data.totalSites,
      subtitle: 'Total pipeline entries',
      icon: Building2,
      gradient: 'bg-white border-2 border-gray-200',
      status: 'neutral'
    },
    {
      title: 'Total Sites Shared',
      value: data.sharedSites,
      subtitle: `${data.shareRate.toFixed(1)}% share rate`,
      icon: Share2,
      gradient: 'bg-white border-2 border-blue-200',
      status: data.shareRate >= 80 ? 'good' : data.shareRate >= 65 ? 'warning' : 'poor'
    },
    {
      title: 'Total Appointments',
      value: data.sitesWithAppointments,
      subtitle: `${data.appointmentRate.toFixed(1)}% appointment rate`,
      icon: Calendar,
      gradient: 'bg-white border-2 border-purple-200',
      status: data.appointmentRate >= 60 ? 'good' : data.appointmentRate >= 45 ? 'warning' : 'poor'
    }
  ];

  // Row 2: With consent metrics
  const row2Cards = [
    {
      title: 'Sites Onboarded (With Consent)',
      value: data.sitesWithConsentCount,
      subtitle: `${data.consentRate.toFixed(1)}% consent rate`,
      icon: CheckCircle,
      gradient: 'bg-white border-2 border-green-200',
      status: data.consentRate >= 75 ? 'good' : data.consentRate >= 60 ? 'warning' : 'poor'
    },
    {
      title: 'Sites Shared (With Consent)',
      value: data.sharedSitesWithConsent,
      subtitle: `${data.sitesWithConsentCount > 0 ? ((data.sharedSitesWithConsent / data.sitesWithConsentCount) * 100).toFixed(1) : 0}% of consented`,
      icon: Share2,
      gradient: 'bg-white border-2 border-emerald-200',
      status: 'good'
    },
    {
      title: 'Appointments (With Consent)',
      value: data.appointmentsWithConsent,
      subtitle: `${data.appointmentRateWithConsent.toFixed(1)}% of consented`,
      icon: Calendar,
      gradient: 'bg-white border-2 border-teal-200',
      status: data.appointmentRateWithConsent >= 60 ? 'good' : data.appointmentRateWithConsent >= 45 ? 'warning' : 'poor'
    }
  ];

  // Row 3: Without consent metrics
  const row3Cards = [
    {
      title: 'Sites Onboarded (Without Consent)',
      value: data.sitesWithoutConsentCount,
      subtitle: `${(100 - data.consentRate).toFixed(1)}% no consent`,
      icon: XCircle,
      gradient: 'bg-white border-2 border-red-200',
      status: 'poor'
    },
    {
      title: 'Sites Shared (Without Consent)',
      value: data.sharedSitesWithoutConsent,
      subtitle: `${data.sitesWithoutConsentCount > 0 ? ((data.sharedSitesWithoutConsent / data.sitesWithoutConsentCount) * 100).toFixed(1) : 0}% of non-consented`,
      icon: Share2,
      gradient: 'bg-white border-2 border-gray-300',
      status: 'warning'
    },
    {
      title: 'Appointments (Without Consent)',
      value: data.appointmentsWithoutConsent,
      subtitle: `${data.appointmentRateWithoutConsent.toFixed(1)}% of non-consented`,
      icon: Calendar,
      gradient: 'bg-white border-2 border-rose-200',
      status: data.appointmentRateWithoutConsent >= 30 ? 'good' : data.appointmentRateWithoutConsent >= 15 ? 'warning' : 'poor'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 mb-8">
        {/* Row 1 Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`row1-${index}`} className="bg-white border-2 border-gray-200 p-6 rounded-lg animate-pulse">
              <div className="h-24 bg-gray-100 rounded"></div>
            </Card>
          ))}
        </div>
        {/* Row 2 Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`row2-${index}`} className="bg-white border-2 border-gray-200 p-6 rounded-lg animate-pulse">
              <div className="h-24 bg-gray-100 rounded"></div>
            </Card>
          ))}
        </div>
        {/* Row 3 Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`row3-${index}`} className="bg-white border-2 border-gray-200 p-6 rounded-lg animate-pulse">
              <div className="h-24 bg-gray-100 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'border-green-300 shadow-sm';
      case 'warning': return 'border-gray-300 shadow-sm';
      case 'poor': return 'border-gray-300 shadow-sm';
      default: return 'border-gray-200 shadow-sm';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'good': return <div className="w-2 h-2 rounded-full bg-green-500"></div>;
      case 'warning': return <div className="w-2 h-2 rounded-full bg-gray-400"></div>;
      case 'poor': return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-gray-300"></div>;
    }
  };

  const renderCardRow = (cards: any[], rowTitle: string) => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{rowTitle}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className={`relative overflow-hidden ${getStatusColor(card.status)} ${card.gradient} text-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <IconComponent className="w-full h-full text-gray-400" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">{card.title}</span>
                </div>
                  {getStatusIndicator(card.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold tracking-tight text-gray-800">
                    {card.value}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {card.subtitle}
                  </div>
                  
                  {card.target && (
                    <div className="text-xs text-gray-500 mt-2">
                      Target: {card.target}%
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 mb-8">
      {renderCardRow(row1Cards, "Total Metrics")}
      {renderCardRow(row2Cards, "With Consent Metrics")}
      {renderCardRow(row3Cards, "Without Consent Metrics")}
    </div>
  );
};

export default KPICards;