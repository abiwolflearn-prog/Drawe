/**
 * English Translation Dictionary
 */
export const en = {
  // Brand & App
  brand: {
    name: '01–80 Number Draw',
    subtitle: 'Web & Telegram Number Draw Platform',
    complianceNotice: 'Compliance Notice: Direct-to-operator payments are reviewed and verified manually by platform admins. Confirm applicable Ethiopian legal, licensing, tax, age, and consumer protection requirements before operating real-money draws.',
    rightsReserved: 'All rights reserved.',
  },

  // Language Selector
  lang: {
    select: 'Select Language',
    amharic: 'አማርኛ',
    english: 'English',
  },

  // Navigation
  nav: {
    home: 'Home',
    activeDraw: 'Active Draw',
    results: 'Results Archive',
    howItWorks: 'How It Works',
    mySelections: 'My Selections',
    adminPortal: 'Admin Portal',
    login: 'Log In',
    register: 'Register',
    logout: 'Log Out',
    profile: 'Profile',
    settings: 'Settings',
  },

  // Common UI
  common: {
    continue: 'Continue',
    confirm: 'Confirm',
    cancel: 'Cancel',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    clear: 'Clear',
    copy: 'Copy',
    copied: 'Copied',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    currencySymbol: 'ETB',
    pricePerNumber: 'Price / Number',
    totalAmount: 'Total Amount',
    closesIn: 'Closes In',
    available: 'Available',
    actionRequired: 'Action Required',
    view: 'View',
    close: 'Close',
  },

  // Draw & Board
  draw: {
    round: 'Round',
    liveRound: 'Live Round',
    availableNumbers: 'Available Numbers',
    selectNumberInstruction: 'Select available numbers on the board above to enter the draw round',
    legendAvailable: 'Available',
    legendSelected: 'Selected',
    legendPending: 'Payment Pending',
    legendConfirmed: 'Confirmed (Taken)',
    legendWinner: 'Winning Number',
    selectedCount: 'Selected Numbers',
    maxSelectionsLimit: 'Maximum 10 selections allowed per draw round.',
    directPaymentGuarantees: 'Direct Operator Payment via Telebirr or CBE',
    instantLock: 'Admin Verification & Instant Number Lock',
    auditableResults: 'Auditable Public Draw Results',
  },

  // Payment Flow
  payment: {
    title: 'Direct Operator Payment & Selection',
    selectMethod: '1. Select Operator Payment Method',
    enterReference: '2. Enter Transaction Reference Number',
    refLabel: 'Transaction Reference ID',
    refPlaceholder: 'e.g. TXN-984720192 or CBE-82910',
    refHelper: 'Copy the transaction reference ID from your Telebirr or Bank SMS receipt.',
    screenshotUrl: 'Screenshot URL (Optional)',
    guaranteeNotice: 'Payment is verified directly by the platform admin. Your selected numbers will be marked as Payment Pending and locked upon approval.',
    submitBtn: 'Submit Payment for Admin Verification',
    submitting: 'Submitting Reference...',
    submittedTitle: 'Reference Under Admin Verification!',
    submittedMessage: 'Your payment reference has been recorded. Platform admins will verify your transfer and confirm your selected numbers.',
    viewMySelections: 'View My Selections',
    statusPending: 'Pending Verification',
    statusApproved: 'Confirmed',
    statusRejected: 'Rejected',
    operatorProvider: 'Provider',
    operatorAccountName: 'Account Name',
    operatorAccountNo: 'Account / Phone No.',
  },

  // Player Dashboard
  player: {
    dashboardTitle: 'Player Account Dashboard',
    mySubmissions: 'My Direct Payment Submissions',
    noSubmissions: 'No payment submissions yet',
    noSubmissionsSub: 'Select available numbers on the main 01–80 board to enter live draw rounds.',
    amountPaid: 'Amount Paid',
    selectedNums: 'Selected Numbers',
  },

  // Admin Portal
  admin: {
    portalTitle: 'Admin Control Center',
    dashboard: 'Dashboard',
    draws: 'Draws',
    numbersBoard: 'Numbers Board',
    paymentsQueue: 'Payments Queue',
    players: 'Players',
    winners: 'Winners',
    results: 'Draw Results',
    reports: 'Reports',
    auditLogs: 'Audit Logs',
    settings: 'Settings',
    metricTotalCollected: 'Total Collected',
    metricPendingApprovals: 'Pending Approvals',
    metricConfirmedNumbers: 'Confirmed Numbers',
    metricAvailableNumbers: 'Available Numbers',
    queueTitle: 'Pending Payment Verification Queue',
    noPending: 'All payment submissions reviewed!',
    noPendingSub: 'No pending references waiting for admin verification.',
    approveBtn: 'Approve',
    rejectBtn: 'Reject',
    tablePlayer: 'Player',
    tableNumbers: 'Numbers',
    tableAmountMethod: 'Amount & Method',
    tableRef: 'Transaction Ref',
    tableStatus: 'Status',
    tableActions: 'Actions',
    auditTitle: 'System Audit Trail',
    auditSub: 'Immutable log recording every sensitive admin operation (payment approvals, rejections, draw triggers, & parameter modifications).',
  },

  // Results & History
  results: {
    title: 'Draw Results & Past Winners',
    subTitle: 'All winning numbers are generated server-side using secure randomness and recorded permanently in system logs.',
    latestWinner: 'Latest Draw Winner',
    winningNumberLabel: 'Winning Number',
    prizeAmountLabel: 'Prize Amount',
    archiveTitle: 'Previous Rounds Archive',
  },

  // Auth & Account
  auth: {
    loginTitle: 'Account Sign In',
    loginSub: 'Sign in to manage your selections and submit payment references.',
    registerTitle: 'Create Player Account',
    registerSub: 'Register to participate in live 01–80 draws and track payment verifications.',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    password: 'Password',
    signInBtn: 'Sign In',
    registerBtn: 'Register Account',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    createAccountLink: 'Create Account',
    demoShortcut: 'Demo Account Shortcuts',
  },

  // Errors
  errors: {
    selectAtLeastOne: 'Please select at least one number.',
    numberTaken: 'This number is no longer available.',
    refRequired: 'Please enter a valid transaction reference number.',
    loginRequired: 'Please log in or create an account to submit payment.',
    networkError: 'A network error occurred. Please try again.',
  },
};
