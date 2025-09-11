import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="activeOnly"
              checked={localFilters.activeOnly || false}
              onCheckedChange={(checked) =>
                handleInputChange('activeOnly', checked)
              }
            />
            <Label
              htmlFor="activeOnly"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active Sites Only
            </Label>
          </div>

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