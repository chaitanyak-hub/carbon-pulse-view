import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { SiteData } from '@/services/api';
import { exportToCSV, exportToExcel, generateFilename } from '@/utils/dataExport';
import { useToast } from '@/hooks/use-toast';

interface DataExportProps {
  sites: SiteData[];
  isLoading?: boolean;
}

const DataExport = ({ sites, isLoading = false }: DataExportProps) => {
  const { toast } = useToast();

  const handleCSVDownload = () => {
    if (sites.length === 0) {
      toast({
        title: "No Data Available",
        description: "There is no data to export. Please load some data first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const filename = generateFilename('site-data');
      exportToCSV(sites, filename);
      toast({
        title: "CSV Export Successful",
        description: `Downloaded ${sites.length} records as ${filename}.csv`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data to CSV. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExcelDownload = () => {
    if (sites.length === 0) {
      toast({
        title: "No Data Available",
        description: "There is no data to export. Please load some data first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const filename = generateFilename('site-data');
      exportToExcel(sites, filename);
      toast({
        title: "Excel Export Successful",
        description: `Downloaded ${sites.length} records as ${filename}.xlsx`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data to Excel. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="dashboard-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Data Export
          </h3>
          <p className="text-muted-foreground">
            Download the current filtered dataset ({sites.length} records)
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleCSVDownload}
            disabled={isLoading || sites.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            CSV
          </Button>
          <Button
            onClick={handleExcelDownload}
            disabled={isLoading || sites.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DataExport;