export type TextSection = string; // Simple text summaries or narratives

export interface TableSection {
  columns: string[]; // Array of column names, e.g., ["asset", "ownership", "value"]
  rows: Array<Record<string, string | number>>; // Array of row objects matching columns, e.g., { asset: "Cash at Bank", value: 50000 }
  totals?: Record<string, number>; // Optional totals, e.g., { totalAssetsValue: 850000 }
}

export interface GroupSection {
  [fieldName: string]: string | number; // Flexible record for groups, e.g., { initialSoaFee: "$500", ongoingAdviceFee: "$200/month" }
}

export interface ChoiceSection {
  [fieldName: string]: string; // Record for choices/enums, e.g., { riskProfileVariant: "fact_find_completed" }
}

// Enum Unions (unchanged)
export type RiskProfileVariant = "fact_find_later" | "fact_find_completed";
export type RiskApproach =
  | "Conservative"
  | "Balanced"
  | "Growth"
  | "High Growth"
  | "Moderate";

// BaseReport: Now includes your specified fields as required commons, plus estatePlanning (universal).
// Types based on templates: unions where formats vary across clients (e.g., goalsObjectives as Text or Table).
export interface BaseReport {
  keyItemsDiscussed: TextSection;
  situationSummary: TextSection;
  goalsObjectives: TextSection | TableSection; // Varies: text in nisu, table in others
  investmentRiskProfile: ChoiceSection & { notes?: TextSection }; // Combined: { approach: RiskApproach, variant?: RiskProfileVariant, notes?: string }
  currentAssets: TableSection; // Consolidated: includes sahi's 'assets', nisu's 'currentAssets'
  cashflowAndExpenses: TextSection; // Consolidated: merges cashflow, incomeNeeds, incomeExpenses
  income: TextSection | TableSection; // Consolidated: for income positions/structures (e.g., sahi's income tables, sera's income mentions)
  debtManagement: TextSection;
  investment: TextSection | TableSection; // Union: text in nisu, table (strategy) in others; notes folded in if needed
  superannuation: TextSection | TableSection; // Union: text in nisu, table (funds) in sahi
  retirementPlanning: TextSection;
  insurance: TextSection;
  centrelink: TextSection;
  ageCare: TextSection;
  estatePlanning: TextSection; // Kept as common
}

// Generic ClientReport: Extends BaseReport with remaining unique sections as optional + index for new ones.
export interface ClientReport extends BaseReport {
  retirementPlanningConsiderations?: TextSection;
  agePension?: TextSection;
  contributionPlan?: TextSection;
  longevityProjections?: TextSection;
  actionItems?: TableSection; // columns: ["raised_from_meeting", "item", "by_whom", "task_in_xplan", "due_by"]
  cashIncomeGrowthDiscussion?: TextSection;
  cashReserves?: TextSection;
  bankAccounts?: TableSection; // columns: ["account", "owner", "balance"] – kept separate as distinct from currentAssets
  ddo?: TextSection;
  csoTasksNonSuper?: TableSection; // columns: ["nTask", "nDescription", "nStatus"]
  csoTasksSuper?: TableSection; // columns: ["task", "description", "status"]
  dependents?: TextSection;
  recommendationsSoa?: TextSection;
  growthWrap?: TextSection;
  discountedStrategies?: TextSection;
  discountedProducts?: TextSection;
  betterPosition?: TextSection;
  shareDividendInstructions?: GroupSection; // { reinvestmentPlan: string, cashAccountInstruction: string }
  administrationNewPortfolio?: TextSection;
  directShares?: TableSection; // columns: ["asx", "ms_recommendation_date", "adviser_recommendation"] – kept as unique

  // Index signature for arbitrary/new sections (e.g., future clients)
  [key: string]:
    | TextSection
    | TableSection
    | GroupSection
    | ChoiceSection
    | Record<string, unknown>
    | undefined;
}

// Client-Specific Interfaces (updated for consolidations)
// Use these for stricter typing when client is known.

export interface BuckleReport extends ClientReport {
  dependents: TextSection; // From sahi, now required here
  retirementPlanningConsiderations: TextSection;
  agePension: TextSection;
  contributionPlan: TextSection;
  longevityProjections: TextSection;
  actionItems: TableSection;
  cashIncomeGrowthDiscussion: TextSection;
  cashReserves: TextSection;
  bankAccounts: TableSection;
  ddo: TextSection;
  // BaseReport fields like goalsObjectives (as TableSection), income (as TableSection for structures), etc., are inherited as required.
}

export interface MoscowReport extends ClientReport {
  fees: GroupSection;
  understandingOfAdvice: TextSection;
}

export interface BateReport extends ClientReport {
  csoTasksNonSuper: TableSection;
  csoTasksSuper: TableSection;
  dependents: TextSection;
  recommendationsSoa: TextSection;
  growthWrap: TextSection;
  discountedStrategies: TextSection;
  discountedProducts: TextSection;
  betterPosition: TextSection;
  shareDividendInstructions: GroupSection;
  administrationNewPortfolio: TextSection;
  directShares: TableSection;
  ddo: TextSection;
  // BaseReport fields like goalsObjectives (as TableSection), etc., inherited.
}
