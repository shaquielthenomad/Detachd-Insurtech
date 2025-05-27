import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import PixelCard from '../common/PixelCard';
import { Button } from '../common/Button';
import { FileTextIcon, PlusCircleIcon, DownloadIcon } from '../common/Icon';
import { ROUTES, MOCK_DELAY } from '../../constants';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ReportItem {
  id: string;
  reportNumber: string;
  title: string;
  createdAt: string;
  filters: string;
  format: 'CSV' | 'PDF' | 'XLSX';
}

const mockReports: ReportItem[] = [
  { id: 'r1', reportNumber: '12345', title: 'All Claims Export - Oct 2024', createdAt: '2024-10-12', filters: 'All claims, Status: All', format: 'CSV' },
  { id: 'r2', reportNumber: '67890', title: 'Open Auto Claims - Q3 2024', createdAt: '2024-10-11', filters: 'Claim Type: Auto, Status: Open', format: 'PDF' },
];

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReports = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        setReports(mockReports);
        setIsLoading(false);
    };
    fetchReports();
  }, []);

  const handleDownloadReport = async (report: ReportItem) => {
    setIsDownloading(report.id);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY / 2));

    let fileContent = '';
    let fileName = `${report.title.replace(/ /g, '_')}_${report.reportNumber}.txt`;
    let mimeType = 'text/plain';

    if (report.format === 'CSV') {
      fileName = `${report.title.replace(/ /g, '_')}_${report.reportNumber}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
      const csvHeader = ['ReportID', 'Title', 'GeneratedAt', 'FilterCriteria', 'Status'];
      const csvData = [
        [report.reportNumber, report.title, report.createdAt, report.filters, 'Sample Status 1'],
        ['SubData-001', 'Detail A', 'Value X', 'Criteria Y', 'Status Z'],
        ['SubData-002', 'Detail B', 'Value P', 'Criteria Q', 'Status R'],
      ];
      fileContent = [csvHeader.join(','), ...csvData.map(row => row.join(','))].join('\r\n');
    } else if (report.format === 'PDF') {
      fileName = `${report.title.replace(/ /g, '_')}_${report.reportNumber}.pdf.txt`;
      mimeType = 'text/plain';
      fileContent = `Mock PDF Content for: ${report.title}\nReport Number: ${report.reportNumber}\nCreated: ${report.createdAt}\nFilters: ${report.filters}\n\nThis is a placeholder for PDF content. Actual PDF generation would require a library like jsPDF.`;
    } else {
      fileContent = `Unsupported format: ${report.format} for report: ${report.title}`;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setIsDownloading(null);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading reports..." />;
  }

  const groupReportsByDate = (reportsToGroup: ReportItem[]) => {
    const grouped: { [key: string]: ReportItem[] } = {};
    reportsToGroup.forEach(report => {
      const date = new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let groupKey = 'Older';
      if (date === today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) groupKey = 'Today';
      else if (date === yesterday.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) groupKey = 'Yesterday';
      
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(report);
    });
    return grouped;
  };
  
  const groupedReports = groupReportsByDate(reports);
  const dateGroups = ['Today', 'Yesterday', 'Older'].filter(group => groupedReports[group] && groupedReports[group].length > 0);

  return (
    <div>
      <PageHeader 
        title="Generated Reports" 
        subtitle="View and download previously generated reports."
        actions={
          <Button 
            leftIcon={<PlusCircleIcon className="h-5 w-5" />}
            onClick={() => console.log("Navigate to create report page")}
          >
            Create New Report
          </Button>
        }
      />

      {reports.length === 0 ? (
         <PixelCard variant="blue">
          <div className="text-center py-12">
            <FileTextIcon className="mx-auto h-12 w-12 text-text-on-dark-secondary" />
            <h3 className="mt-2 text-sm font-medium text-text-on-dark-primary">No reports generated yet</h3>
            <p className="mt-1 text-sm text-text-on-dark-secondary">Create a new report to get started.</p>
            <div className="mt-6">
               <Button 
                leftIcon={<PlusCircleIcon className="h-5 w-5" />}
                onClick={() => console.log("Navigate to create report page")}
                >
                Create New Report
              </Button>
            </div>
          </div>
        </PixelCard>
      ) : (
        dateGroups.map(groupName => (
            <div key={groupName} className="mb-8">
                <h2 className="text-xl font-semibold text-text-light mb-3">{groupName}</h2>
                <div className="space-y-4">
                    {groupedReports[groupName].map((report) => (
                    <PixelCard key={report.id} variant="blue" className="hover:border-blue-400 transition-colors">
                        <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                            <FileTextIcon className="h-6 w-6 text-blue-400 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-md font-medium text-text-on-dark-primary truncate">
                                Report #{report.reportNumber} - {report.title}
                                </p>
                                <p className="text-sm text-text-on-dark-secondary">
                                Filters: {report.filters}
                                </p>
                            </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 ml-9">
                                Created on {new Date(report.createdAt).toLocaleString()} &middot; Format: {report.format}
                            </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-blue-400 text-blue-300 hover:bg-blue-700/30" 
                                leftIcon={<DownloadIcon className="h-4 w-4" />}
                                onClick={() => handleDownloadReport(report)}
                                isLoading={isDownloading === report.id}
                                disabled={isDownloading === report.id}
                            >
                            {isDownloading === report.id ? 'Downloading...' : 'Download'}
                            </Button>
                        </div>
                        </div>
                    </PixelCard>
                    ))}
                </div>
            </div>
        ))
      )}
    </div>
  );
};