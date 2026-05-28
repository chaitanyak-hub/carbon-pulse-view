import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3, ArrowLeft, Download } from 'lucide-react';
import { fetchSiteActivity, SiteData } from '@/services/api';

const getToday = () => new Date().toISOString().split('T')[0];
const getDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const LcrStats = () => {
  const [from, setFrom] = useState(getDaysAgo(30));
  const [to, setTo] = useState(getToday());
  const [applied, setApplied] = useState({ from, to });
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lcrStats', applied.from, applied.to],
    queryFn: async () => {
      const res = await fetchSiteActivity({
        utmSource: 'PROJECTSOLAR',
        siteType: 'domestic',
        includeSiteDetails: true,
        from: applied.from,
        to: applied.to,
        limit: 5000,
        offset: 0,
      });
      return res?.data?.sites || [];
    },
  });

  useEffect(() => { refetch(); }, [applied, refetch]);

  const sites = (data as SiteData[] | undefined) || [];

  const columns = useMemo(() => {
    const set = new Set<string>();
    sites.forEach(s => Object.keys(s || {}).forEach(k => set.add(k)));
    return Array.from(set);
  }, [sites]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sites;
    const q = search.toLowerCase();
    return sites.filter(s => JSON.stringify(s).toLowerCase().includes(q));
  }, [sites, search]);

  const fmt = (v: any) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  const exportCsv = () => {
    const head = columns.join(',');
    const rows = filtered.map(r =>
      columns.map(c => {
        const v = fmt((r as any)[c]).replace(/"/g, '""');
        return `"${v}"`;
      }).join(',')
    );
    const blob = new Blob([head + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lcr-stats-${applied.from}-to-${applied.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-primary text-primary-foreground py-6 px-4">
        <div className="container mx-auto max-w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">LCR Stats</h1>
              <p className="text-sm opacity-90">Raw site activity data (same source as KPIs)</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="secondary" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-full px-4 py-6">
        <Card className="p-4 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <Button onClick={() => setApplied({ from, to })} disabled={isLoading}>
              {isLoading ? 'Loading…' : 'Apply'}
            </Button>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground">Search</label>
              <Input placeholder="Search any field..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
              <Download className="h-4 w-4 mr-1" />Export CSV
            </Button>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {isLoading ? 'Fetching…' : `${filtered.length} rows · ${columns.length} columns`}
          </div>
        </Card>

        {error && (
          <Alert className="mb-4 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {error instanceof Error ? error.message : 'Failed to load'}
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-0 overflow-hidden">
          <div className="overflow-auto max-h-[75vh]">
            <table className="text-xs border-collapse w-max">
              <thead className="sticky top-0 bg-muted z-10">
                <tr>
                  <th className="border px-2 py-1 text-left sticky left-0 bg-muted">#</th>
                  {columns.map(c => (
                    <th key={c} className="border px-2 py-1 text-left whitespace-nowrap font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/40">
                    <td className="border px-2 py-1 sticky left-0 bg-white">{i + 1}</td>
                    {columns.map(c => {
                      const v = fmt((row as any)[c]);
                      return (
                        <td key={c} className="border px-2 py-1 whitespace-nowrap max-w-[280px] truncate" title={v}>
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {!filtered.length && !isLoading && (
                  <tr><td colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LcrStats;
