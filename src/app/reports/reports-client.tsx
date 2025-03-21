'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Share, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createClient } from '../../../supabase/client';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/translations/useTranslation';
import { languages, Language } from '@/lib/translations';

interface Collection {
  id: string;
  amount: number;
  collection_date: string;
  type: string;
  mosques: { name: string }[];
}

interface Distribution {
  id: string;
  amount: number;
  distribution_date: string;
  type: string;
  status: string;
  beneficiaries: { name: string }[];
}

interface ReportsClientProps {
  initialCollections: Collection[];
  initialDistributions: Distribution[];
}

export default function ReportsClient({
  initialCollections,
  initialDistributions,
}: ReportsClientProps) {
  const [reportType, setReportType] = useState('collection');
  const [dateRange, setDateRange] = useState('current_month');
  const [format, setFormat] = useState('detailed');
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [distributions, setDistributions] = useState<Distribution[]>(initialDistributions);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use our translation hook instead of inline translations
  const { t, language, changeLanguage } = useTranslation();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const supabase = createClient();

    try {
      let startDate = new Date();
      let endDate = new Date();

      // Calculate date range
      switch (dateRange) {
        case 'current_month':
          startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
          break;
        case 'last_month':
          startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
          endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
          break;
        case 'last_3_months':
          startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 3, 1);
          break;
        case 'year_to_date':
          startDate = new Date(startDate.getFullYear(), 0, 1);
          break;
      }

      // Format dates for query
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      if (reportType === 'collection' || reportType === 'summary') {
        const { data: collectionsData, error: collectionsError } = await supabase
          .from('zakat_collections')
          .select('id, amount, collection_date, type, mosques(name)')
          .gte('collection_date', formattedStartDate)
          .lte('collection_date', formattedEndDate)
          .order('collection_date', { ascending: false });

        if (collectionsError) throw collectionsError;
        if (collectionsData) setCollections(collectionsData as Collection[]);
      }

      if (reportType === 'distribution' || reportType === 'summary') {
        const { data: distributionsData, error: distributionsError } = await supabase
          .from('zakat_distributions')
          .select('id, amount, distribution_date, type, status, beneficiaries(name)')
          .gte('distribution_date', formattedStartDate)
          .lte('distribution_date', formattedEndDate)
          .order('distribution_date', { ascending: false });

        if (distributionsError) throw distributionsError;
        if (distributionsData) setDistributions(distributionsData as Distribution[]);
      }

      toast.success(t.reports.reportGenerated);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(t.reports.failedToGenerateReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (fileType: 'pdf' | 'excel') => {
    if (fileType === 'pdf') {
      const doc = new jsPDF();
      doc.text(t.reports.reportData, 10, 10);
      // Add collection data to PDF
      if (reportType === 'collection' || reportType === 'summary') {
        doc.text(t.reports.collections, 10, 20);
        collections.forEach((collection, index) => {
          const y = 30 + index * 10;
          doc.text(
            `${collection.id.substring(0, 8)} - ${new Date(collection.collection_date).toLocaleDateString()} - ${collection.amount} ETB`,
            10,
            y
          );
        });
      }
      // Add distribution data
      if (reportType === 'distribution' || reportType === 'summary') {
        const startY = reportType === 'summary' ? 30 + collections.length * 10 + 10 : 20;
        doc.text(t.reports.distributions, 10, startY);
        distributions.forEach((distribution, index) => {
          const y = startY + 10 + index * 10;
          doc.text(
            `${distribution.id.substring(0, 8)} - ${new Date(distribution.distribution_date).toLocaleDateString()} - ${distribution.amount} ETB`,
            10,
            y
          );
        });
      }

      doc.save('zakat_report.pdf');
      toast.success(t.reports.pdfDownloaded);
    } else {
      // Excel download would use a library like xlsx
      toast.info(t.reports.excelDownloadInfo);
    }
  };

  const handleShare = () => {
    // Implement sharing functionality
    toast.info(t.reports.sharingReport);
  };

  // Prepare CSV data
  const getCollectionsCsvData = () => {
    return collections.map((collection) => ({
      id: collection.id,
      date: new Date(collection.collection_date).toLocaleDateString(),
      mosque:
        Array.isArray(collection.mosques) && collection.mosques.length > 0
          ? collection.mosques[0].name
          : 'Unknown Mosque',
      type: collection.type,
      amount: collection.amount,
    }));
  };

  const getDistributionsCsvData = () => {
    return distributions.map((distribution) => ({
      id: distribution.id,
      date: new Date(distribution.distribution_date).toLocaleDateString(),
      beneficiary: distribution.beneficiaries?.[0]?.name || 'Unknown Beneficiary',
      type: distribution.type,
      status: distribution.status,
      amount: distribution.amount,
    }));
  };

  return (
    <div>
      {/* Language Selector */}
      <div className="flex justify-end mb-4">
        <Select value={language} onValueChange={(value: Language) => changeLanguage(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.common.language} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(languages).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Report Generator */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.reports.reportGenerator}</h2>
        <p className="text-muted-foreground mb-6">{t.reports.configureReports}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t.reports.reportType}</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder={t.reports.zakatCollection} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collection">{t.reports.zakatCollection}</SelectItem>
                <SelectItem value="distribution">{t.reports.beneficiaryDistribution}</SelectItem>
                <SelectItem value="summary">{t.reports.summaryReport}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.reports.dateRange}</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder={t.reports.currentMonth} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">{t.reports.currentMonth}</SelectItem>
                <SelectItem value="last_month">{t.reports.lastMonth}</SelectItem>
                <SelectItem value="last_3_months">{t.reports.last3Months}</SelectItem>
                <SelectItem value="year_to_date">{t.reports.yearToDate}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.reports.format}</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder={t.reports.detailed} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detailed">{t.reports.detailed}</SelectItem>
                <SelectItem value="summary">{t.reports.summary}</SelectItem>
                <SelectItem value="charts">{t.reports.withCharts}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="flex items-center gap-2"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            <FileText size={16} />
            {isGenerating ? t.reports.generating : t.reports.generateReport}
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="collection">
        <TabsList className="mb-6">
          <TabsTrigger value="collection">{t.reports.zakatCollection}</TabsTrigger>
          <TabsTrigger value="distribution">{t.reports.beneficiaryDistribution}</TabsTrigger>
        </TabsList>

        <TabsContent value="collection">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="relative w-64">
                <Input placeholder={t.reports.searchReports} className="pl-3" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleDownload('pdf')}
                >
                  <Download size={14} />
                  PDF
                </Button>
                <CSVLink
                  data={getCollectionsCsvData()}
                  filename="zakat_collections.csv"
                  className="flex items-center gap-1 h-9 rounded-md px-3 text-xs bg-transparent hover:bg-accent hover:text-accent-foreground border border-input inline-flex items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Download size={14} />
                  CSV
                </CSVLink>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleShare}
                >
                  <Share size={14} />
                  Share
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500 border-b">
                    <th className="p-4">{t.common.id}</th>
                    <th className="p-4">{t.common.date}</th>
                    <th className="p-4">{t.reports.mosque}</th>
                    <th className="p-4">{t.common.type}</th>
                    <th className="p-4">{t.common.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr key={collection.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{collection.id.substring(0, 8)}</td>
                      <td className="p-4 text-gray-600">
                        {new Date(collection.collection_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-600">
                        {Array.isArray(collection.mosques) && collection.mosques.length > 0
                          ? collection.mosques[0].name
                          : 'Unknown Mosque'}
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded-full">
                          {collection.type === 'cash' ? t.common.cash : t.common.inKind}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{collection.amount} ETB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="relative w-64">
                <Input placeholder={t.reports.searchReports} className="pl-3" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleDownload('pdf')}
                >
                  <Download size={14} />
                  PDF
                </Button>
                <CSVLink
                  data={getDistributionsCsvData()}
                  filename="zakat_distributions.csv"
                  className="flex items-center gap-1 h-9 rounded-md px-3 text-xs bg-transparent hover:bg-accent hover:text-accent-foreground border border-input inline-flex items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Download size={14} />
                  CSV
                </CSVLink>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleDownload('excel')}
                >
                  <Download size={14} />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleShare}
                >
                  <Share size={14} />
                  Share
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500 border-b">
                    <th className="p-4">{t.common.id}</th>
                    <th className="p-4">{t.common.date}</th>
                    <th className="p-4">{t.reports.beneficiary}</th>
                    <th className="p-4">{t.common.type}</th>
                    <th className="p-4">{t.common.status}</th>
                    <th className="p-4">{t.common.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map((distribution) => (
                    <tr key={distribution.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{distribution.id.substring(0, 8)}</td>
                      <td className="p-4 text-gray-600">
                        {new Date(distribution.distribution_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-600">
                        {distribution.beneficiaries?.[0]?.name || 'Unknown Beneficiary'}
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded-full">
                          {distribution.type === 'cash' ? t.common.cash : t.common.inKind}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`${
                            distribution.status === 'approved'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-yellow-100 text-yellow-600'
                          } text-xs px-2 py-1 rounded-full`}
                        >
                          {distribution.status === 'approved'
                            ? t.common.approved
                            : distribution.status}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{distribution.amount} ETB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
