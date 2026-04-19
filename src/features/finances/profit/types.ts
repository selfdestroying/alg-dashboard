export interface TaxBreakdown {
  taxSystem: string
  taxSystemLabel: string
  incomeTax: number
  incomeTaxRate: number
  insuranceContributions: number
  fixedContributions: number
}

export interface AcquiringBreakdownItem {
  methodName: string
  commissionPercent: number
  paymentSum: number
  fee: number
}

export interface AcquiringData {
  total: number
  breakdown: AcquiringBreakdownItem[]
}

export interface SalaryData {
  total: number
  totalFromLessons: number
  totalFromPaychecks: number
  teacherCount: number
  lessonCount: number
}

export interface RentData {
  total: number
  breakdown: RentBreakdownItem[]
}

export interface RentBreakdownItem {
  locationName: string
  amount: number
}

export interface ExpenseData {
  total: number
  breakdown: ExpenseBreakdownItem[]
}

export interface ExpenseBreakdownItem {
  name: string
  amount: number
}

export interface ProfitData {
  revenue: number
  taxes: {
    total: number
    breakdown: TaxBreakdown
  }
  acquiring: AcquiringData
  salaries: SalaryData
  rent: RentData
  expenses: ExpenseData
  profit: number
}
