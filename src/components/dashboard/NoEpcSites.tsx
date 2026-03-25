import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { SiteData } from '@/services/api';
import { exportToExcel, generateFilename } from '@/utils/dataExport';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface NoEpcSitesProps {
  sites: SiteData[];
}

const NoEpcSites = ({ sites }: NoEpcSitesProps) => {
  const { toast } = useToast();

  const noEpcSites = sites.filter(site => {
    const epc = site.epc_available;
    return epc === false || epc === null || String(epc).toLowerCase() === 'no' || String(epc).toLowerCase() === 'false';
  });

  const handleExport = () => {
    if (noEpcSites.length === 0) return;
    try {
      const filename = generateFilename('no-epc-sites');
      exportToExcel(noEpcSites, filename);
      toast({
        title: "Export Successful",
        description: `Downloaded ${noEpcSites.length} sites without EPC as ${filename}.xlsx`,
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="dashboard-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Sites Without EPC — {noEpcSites.length} records
              </h3>
              <p className="text-sm text-muted-foreground">
                All sites where EPC Available is "No"
              </p>
            </div>
          </div>
          <Button
            onClick={handleExport}
            disabled={noEpcSites.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </Card>

      <Card className="dashboard-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">#</TableHead>
              <TableHead className="font-semibold">Site Address</TableHead>
              <TableHead className="font-semibold">Agent</TableHead>
              <TableHead className="font-semibold">EPC Available</TableHead>
              <TableHead className="font-semibold">Current EPC Rating</TableHead>
              <TableHead className="font-semibold">Onboard Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noEpcSites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No sites without EPC found.
                </TableCell>
              </TableRow>
            ) : (
              noEpcSites.map((site, index) => (
                <TableRow key={site.siteId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="max-w-xs truncate">{site.siteAddress || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">{site.agent_name || 'N/A'}</TableCell>
                  <TableCell>{String(site.epc_available ?? 'N/A')}</TableCell>
                  <TableCell>{site.current_epc_rating || 'N/A'}</TableCell>
                  <TableCell>{site.onboard_date ? new Date(site.onboard_date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{site.site_status || 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default NoEpcSites;
