export type JobCategory =
  | 'central-government'
  | 'tamil-nadu'
  | 'railway'
  | 'ssc'
  | 'upsc'
  | 'banking'
  | 'defence'
  | 'admit-cards'
  | 'results';

export type JobStatus = 'NEW' | 'APPLY NOW' | 'CLOSING SOON' | 'CLOSED';

export interface EligibilityCriteria {
  education: string[];
  ageLimit: {
    min?: number;
    max?: number;
    description: string;
    relaxationRules?: string;
  };
  nationality?: string;
}

export interface VacancyBreakdown {
  postName: string;
  vacancies: number | string;
  qualification?: string;
}

export interface ApplicationFee {
  generalOBC?: string;
  scStFemale?: string;
  paymentMode?: string;
  note?: string;
}

export interface ImportantDates {
  notificationDate?: string;
  startDate: string;
  lastDate: string;
  feePaymentLastDate?: string;
  examDate?: string;
  admitCardDate?: string;
  resultDate?: string;
}

export interface SalaryDetails {
  payScale?: string;
  gradePay?: string;
  inHandEstimate?: string;
  officialDetails: string;
}

export interface GovtJob {
  id: string;
  slug: string;
  title: string;
  organization: string;
  shortOrg: string;
  department: string;
  category: JobCategory;
  qualification: string;
  vacancies: number | string;
  location: string;
  startDate: string; // ISO YYYY-MM-DD
  lastDate: string; // ISO YYYY-MM-DD
  officialNotificationUrl: string;
  officialApplyUrl: string;
  sourceUrl: string;
  lastVerifiedDate: string; // ISO YYYY-MM-DD
  overview: string; // Editorial summary
  officialSummary: string; // Excerpt from official notification
  eligibilityCriteria: EligibilityCriteria;
  vacancyBreakdown?: VacancyBreakdown[];
  applicationFee?: ApplicationFee;
  importantDates: ImportantDates;
  selectionProcess: string[];
  salary: SalaryDetails;
  isAdmitCard?: boolean;
  isResult?: boolean;
  featured?: boolean;
}

export interface JobCategoryMeta {
  id: JobCategory;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  path: string;
}

