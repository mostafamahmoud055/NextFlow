/** Main sidebar navigation — routes may be placeholders until pages exist. */
export const navigationItems = [
  {
    titleKey: "navigation.dashboard",
    icon: "mdi-view-dashboard-outline",
    to: "/",
  },

  // Operational modules
  {
    titleKey: "navigation.sales",
    icon: "mdi-receipt",
    children: [
      { titleKey: "navigation.manageInvoices", to: "/sales/invoices" },
      { titleKey: "navigation.createInvoice", to: "/sales/create" },
      { titleKey: "navigation.manageEstimates", to: "/sales/estimates" },
      { titleKey: "navigation.createEstimate", to: "/sales/create-estimate" },
      { titleKey: "navigation.creditNotes", to: "/sales/credit-notes" },
      { titleKey: "navigation.refundReceipts", to: "/sales/refunds" },
      { titleKey: "navigation.recurringInvoices", to: "/sales/recurring" },
      { titleKey: "navigation.clientPayments", to: "/sales/payments" },
      { titleKey: "navigation.salesSettings", to: "/sales/settings" },
    ],
  },
  {
    titleKey: "navigation.clients",
    icon: "mdi-account-tie",
    children: [
      { titleKey: "navigation.users", to: "/clients/users" },
    ],
  },
  {
    titleKey: "navigation.inventory",
    icon: "mdi-package-variant-closed",
    children: [
      { titleKey: "navigation.products", to: "/inventory/products" },
    ],
  },
  {
    titleKey: "navigation.purchases",
    icon: "mdi-truck-outline",
    children: [
      { titleKey: "navigation.purchaseInvoices", to: "/purchases/invoices" },
      { titleKey: "navigation.purchaseRefunds", to: "/purchases/refunds" },
      { titleKey: "navigation.debitNotes", to: "/purchases/debit-notes" },
      { titleKey: "navigation.manageSuppliers", to: "/purchases/suppliers" },
      { titleKey: "navigation.suppliersPayments", to: "/purchases/payments" },
      { titleKey: "navigation.purchaseSettings", to: "/purchases/settings" },
    ],
  },
  {
    titleKey: "navigation.finance",
    icon: "mdi-safe",
    children: [
      { titleKey: "navigation.reports", to: "/finance/reports" },
    ],
  },
  {
    titleKey: "navigation.accounting",
    icon: "mdi-cash-multiple",
    children: [
      { titleKey: "navigation.ledger", to: "/accounting/ledger" },
    ],
  },
  {
    titleKey: "navigation.employees",
    icon: "mdi-account-group",
    children: [
      { titleKey: "navigation.staff", to: "/employees/staff" },
    ],
  },

  { type: "divider" },

  // Company / system setup
  {
    titleKey: "navigation.companySettings",
    icon: "mdi-office-building-cog-outline",
    children: [
      { titleKey: "navigation.companyManagement", to: "/settings/company/companies" },
      { titleKey: "navigation.branchManagement", to: "/settings/company/branches" },
      { titleKey: "navigation.departmentsManagement", to: "/settings/company/departments" },
      { titleKey: "navigation.warehousesManagement", to: "/settings/company/warehouses" },
    ],
  },
  {
    titleKey: "navigation.financialSetup",
    icon: "mdi-bank-outline",
    children: [
      { titleKey: "navigation.fiscalYearsManagement", to: "/settings/company/fiscal-years" },
      { titleKey: "navigation.accountingPeriodsManagement", to: "/settings/financial/accounting-periods" },
      { titleKey: "navigation.currencyManagement", to: "/settings/financial/currencies" },
      { titleKey: "navigation.exchangeRatesManagement", to: "/settings/financial/exchange-rates" },
      { titleKey: "navigation.taxManagement", to: "/settings/financial/taxes" },
      { titleKey: "navigation.paymentTerms", to: "/settings/financial/payment-terms" },
      { titleKey: "navigation.costCentersManagement", to: "/settings/financial/cost-centers" },
      { titleKey: "navigation.profitCentersManagement", to: "/settings/financial/profit-centers" },
      { titleKey: "navigation.documentNumbering", to: "/settings/financial/document-numbering" },
    ],
  },
  {
    titleKey: "navigation.accessControl",
    icon: "mdi-shield-account-outline",
    children: [
      { titleKey: "navigation.userManagement", to: "/settings/access/users" },
      { titleKey: "navigation.rolesManagement", to: "/settings/access/roles" },
      { titleKey: "navigation.permissionsManagement", to: "/settings/access/permissions" },
      { titleKey: "navigation.approvalRulesManagement", to: "/settings/access/approval-rules" },
    ],
  },
  {
    titleKey: "navigation.systemSettings",
    icon: "mdi-cog-outline",
    children: [
      { titleKey: "navigation.emailSettings", to: "/settings/system/email" },
      { titleKey: "navigation.smsSettings", to: "/settings/system/sms" },
      { titleKey: "navigation.systemPreferences", to: "/settings/system/preferences" },
      { titleKey: "navigation.auditLog", to: "/settings/system/audit-log" },
    ],
  },
];
