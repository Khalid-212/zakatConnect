// Main translation system export file
import { am } from './am';
import { en } from './en';

export type Language = 'en' | 'am';

export const languages = {
  en: 'English',
  am: 'አማርኛ (Amharic)',
};

export const translations = {
  en,
  am,
};

// Define the complete type structure for translations
export type TranslationType = {
  common: {
    language: string;
    id: string;
    date: string;
    type: string;
    amount: string;
    status: string;
    search: string;
    save: string;
    edit: string;
    delete: string;
    cancel: string;
    add: string;
    view: string;
    download: string;
    share: string;
    success: string;
    error: string;
    loading: string;
    cash: string;
    inKind: string;
    approved: string;
    pending: string;
    rejected: string;
    actions: string;
    notAvailable: string;
    processing: string;
    approve: string;
    invalidAmount: string;
    updateFailed: string;
    errorOccurred: string;
  };
  reports: {
    reportGenerator: string;
    configureReports: string;
    reportType: string;
    dateRange: string;
    format: string;
    generateReport: string;
    generating: string;
    reportGenerated: string;
    failedToGenerateReport: string;
    zakatCollection: string;
    beneficiaryDistribution: string;
    summaryReport: string;
    currentMonth: string;
    lastMonth: string;
    last3Months: string;
    yearToDate: string;
    detailed: string;
    summary: string;
    withCharts: string;
    mosque: string;
    beneficiary: string;
    searchReports: string;
    reportData: string;
    collections: string;
    distributions: string;
    pdfDownloaded: string;
    excelDownloadInfo: string;
    sharingReport: string;
  };
  beneficiaries: {
    title: string;
    subtitle: string;
    addBeneficiary: string;
    editBeneficiary: string;
    name: string;
    contact: string;
    address: string;
    category: string;
    needsAssessment: string;
    familySize: string;
    monthlyIncome: string;
    distributionsReceived: string;
    lastDistribution: string;
    registrationDate: string;
    notes: string;
    noData: string;
    searchBeneficiaries: string;
    distributions: string;
    documents: string;
    enterDistributionAmount: string;
    enterAmountPrompt: string;
    enterAmount: string;
  };
  givers: {
    title: string;
    subtitle: string;
    addGiver: string;
    editGiver: string;
    name: string;
    contact: string;
    email: string;
    address: string;
    totalContributions: string;
    lastContribution: string;
    mosque: string;
    preferredPaymentMethod: string;
    registrationDate: string;
    notes: string;
    anonymous: string;
    recurring: string;
    frequency: string;
    noData: string;
    searchGivers: string;
    contributions: string;
    taxReceipts: string;
    allMosques: string;
    selectMosque: string;
    phone: string;
    codeAssigned: string;
    totalDonations: string;
  };
};

// Update the translation export type
export type TranslationKey = keyof TranslationType;
