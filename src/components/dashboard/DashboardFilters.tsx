import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CalendarIcon, FilterIcon } from 'lucide-react';
import { SiteActivityFilters } from '@/services/api';

interface DashboardFiltersProps {
  filters: SiteActivityFilters;
  onFiltersChange: (filters: SiteActivityFilters) => void;
  onApplyFilters: () => void;
  isLoading?: boolean;
}

const DashboardFilters = ({ 
  filters, 
  onFiltersChange, 
  onApplyFilters, 
  isLoading = false 
}: DashboardFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<SiteActivityFilters>(filters);

  const handleInputChange = (field: keyof SiteActivityFilters, value: string) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleApply = () => {
    onApplyFilters();
  };

  return (
    <Card className="dashboard-card mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <FilterIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from-date" className="text-sm font-medium">
              From Date
            </Label>
            <div className="relative">
              <Input
                id="from-date"
                type="date"
                value={localFilters.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-date" className="text-sm font-medium">
              To Date
            </Label>
            <div className="relative">
              <Input
                id="to-date"
                type="date"
                value={localFilters.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-email" className="text-sm font-medium">
              Agent Email (Optional)
            </Label>
            <Input
              id="agent-email"
              type="email"
              placeholder="Enter agent email..."
              value={localFilters.agentEmail || ''}
              onChange={(e) => handleInputChange('agentEmail', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleApply}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            {isLoading ? 'Loading...' : 'Apply Filters'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DashboardFilters;