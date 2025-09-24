import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { FilterIcon } from 'lucide-react';
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

  const handleInputChange = (field: keyof SiteActivityFilters, value: string | boolean) => {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">UTM Source</Label>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-foreground">Project Solar</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromDate" className="text-sm font-medium">
              From Date
            </Label>
            <Input
              id="fromDate"
              type="date"
              value={localFilters.fromDate || ''}
              onChange={(e) => handleInputChange('fromDate', e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toDate" className="text-sm font-medium">
              To Date
            </Label>
            <Input
              id="toDate"
              type="date"
              value={localFilters.toDate || ''}
              onChange={(e) => handleInputChange('toDate', e.target.value)}
              className="w-full"
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