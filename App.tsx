import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { SecureLoginPage } from './components/auth/SecureLoginPage';
import { DashboardOverviewPage } from './components/dashboard/DashboardOverviewPage';
import { MyClaimsPage } from './components/claims/MyClaimsPage';
import { ClaimDetailsPage } from './components/claims/ClaimDetailsPage';
import { StartClaimPage } from './components/claims/StartClaimPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { HelpCenterPage } from './components/help/HelpCenterPage';
import { WelcomePage } from './components/onboarding/WelcomePage';
import { EnterClaimCodePage } from './components/onboarding/EnterClaimCodePage';
import { VerificationPage } from './components/onboarding/VerificationPage';
import { UploadIdPage } from './components/onboarding/UploadIdPage';
import { DeclarationPage } from './components/claims/DeclarationPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { TeamDirectoryPage } from './components/team/TeamDirectoryPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { UserProfilePage } from './components/profile/UserProfilePage';
import { PolicyholderWelcomePage } from './components/onboarding/PolicyholderWelcomePage';
import { useSecureAuth, SecureAuthProvider } from './contexts/SecureAuthContext';
import { ROUTES } from './constants';
import { RoleSelectionPage } from './components/onboarding/RoleSelectionPage';
import { VerificationStatusPage } from './components/onboarding/VerificationStatusPage';
import { AdditionalInfoPage } from './components/onboarding/AdditionalInfoPage';
import { UploadDocumentsPage } from './components/claims/UploadDocumentsPage';
import { ClaimSuccessPage } from './components/claims/ClaimSuccessPage';
import { PlaceholderPage } from './components/common/PlaceholderPage';
import { TermsPage } from './components/legal/TermsPage';
import { PrivacyPage } from './components/legal/PrivacyPage';
import { AboutPage } from './components/legal/AboutPage';
import { ContactSupportPage } from './components/help/ContactSupportPage';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { NotificationSettingsPage } from './components/notifications/NotificationSettingsPage';
import { PolicyPlanPage } from './components/policy/PolicyPlanPage';
import { TasksPage } from './components/tasks/TasksPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ReportIssuePage } from './components/help/ReportIssuePage';
import { ClaimStatusOverviewPage } from './components/claims/ClaimStatusOverviewPage';
import { PublicContactPage } from './components/common/PublicContactPage'; 
import ClaimVerificationCertificatePage from './components/claims/ClaimVerificationCertificatePage';
import { InsuranceCodePage } from './components/onboarding/InsuranceCodePage';
import { ThirdPartyInfoPage } from './components/onboarding/ThirdPartyInfoPage';
import { WitnessClaimCodePage } from './components/onboarding/WitnessClaimCodePage';
import { InsurerDepartmentPage } from './components/onboarding/InsurerDepartmentPage';
import { LogoutSuccessPage } from './components/auth/LogoutSuccessPage';
import { NewPolicyPage } from './components/policy/NewPolicyPage';
import PolicyDetailsPage from './components/policy/PolicyDetailsPage';
import EditPolicyPage from './components/policy/EditPolicyPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useSecureAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SecureAuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
            <Route path={ROUTES.LOGIN} element={<SecureLoginPage />} />
            <Route path={ROUTES.ENTER_CLAIM_CODE} element={<EnterClaimCodePage />} />
            
            {/* Onboarding Routes */}
            <Route path={ROUTES.ONBOARDING_ROLE_SELECTION} element={<RoleSelectionPage />} />
            <Route path={ROUTES.SIGNUP} element={<Navigate to={ROUTES.ONBOARDING_ROLE_SELECTION} replace />} />
            <Route path={ROUTES.ONBOARDING_VERIFICATION} element={<VerificationPage />} />
            <Route path={ROUTES.ONBOARDING_VERIFICATION_STATUS} element={<VerificationStatusPage />} />
            <Route path={ROUTES.ONBOARDING_ADDITIONAL_INFO} element={<AdditionalInfoPage />} />
            <Route path={ROUTES.ONBOARDING_UPLOAD_ID} element={<UploadIdPage />} />
            <Route path={ROUTES.ONBOARDING_POLICYHOLDER_WELCOME} element={<PolicyholderWelcomePage />} />
            <Route path={ROUTES.ONBOARDING_INSURANCE_CODE} element={<InsuranceCodePage />} />
            <Route path={ROUTES.ONBOARDING_THIRD_PARTY_INFO} element={<ThirdPartyInfoPage />} />
            <Route path={ROUTES.ONBOARDING_WITNESS_CLAIM_CODE} element={<WitnessClaimCodePage />} />
            <Route path={ROUTES.ONBOARDING_INSURER_DEPARTMENT} element={<InsurerDepartmentPage />} />
            <Route path={ROUTES.LOGOUT_SUCCESS} element={<LogoutSuccessPage />} />

            {/* Auth Routes */}
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<PlaceholderPage />} />
            <Route path={ROUTES.TWO_FACTOR_AUTH} element={<PlaceholderPage />} />
            <Route path={ROUTES.VERIFY_ACCOUNT} element={<PlaceholderPage />} />

            {/* Legal/Info Pages */}
            <Route path={ROUTES.ABOUT_APP} element={<AboutPage />} />
            <Route path={ROUTES.TERMS_CONDITIONS} element={<TermsPage />} />
            <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPage />} />
            <Route path={ROUTES.CONTACT} element={<PublicContactPage />} />
            <Route path={ROUTES.ACCESSIBILITY_STATEMENT} element={<PlaceholderPage />} />
            <Route path={ROUTES.COMPLIANCE_INFO} element={<PlaceholderPage />} />
            <Route path={ROUTES.DISPUTE_RESOLUTION} element={<PlaceholderPage />} />

            {/* Protected Routes */}
            <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><Layout><DashboardOverviewPage /></Layout></ProtectedRoute>} />
            
            {/* Claims Routes */}
            <Route path={ROUTES.CLAIMS} element={<ProtectedRoute><Layout><MyClaimsPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.CLAIM_DETAILS} element={<ProtectedRoute><Layout><ClaimDetailsPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.CLAIM_VERIFICATION_CERTIFICATE} element={<ProtectedRoute><Layout><ClaimVerificationCertificatePage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.CLAIM_STATUS_OVERVIEW} element={<ProtectedRoute><Layout><ClaimStatusOverviewPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.NEW_CLAIM} element={<ProtectedRoute><Layout><StartClaimPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.NEW_CLAIM_UPLOAD_DOCUMENTS} element={<ProtectedRoute><Layout><UploadDocumentsPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.NEW_CLAIM_DECLARATION} element={<ProtectedRoute><Layout><DeclarationPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.NEW_CLAIM_SUCCESS} element={<ProtectedRoute><Layout><ClaimSuccessPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.CLAIM_SUCCESS} element={<ProtectedRoute><Layout><ClaimSuccessPage /></Layout></ProtectedRoute>} />
            
            {/* Policy Routes */}
            <Route path={ROUTES.MY_POLICY} element={<ProtectedRoute><Layout><PolicyPlanPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.POLICY_DETAILS} element={<ProtectedRoute><Layout><PolicyDetailsPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.NEW_POLICY} element={<ProtectedRoute><Layout><NewPolicyPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.EDIT_POLICY} element={<ProtectedRoute><Layout><EditPolicyPage /></Layout></ProtectedRoute>} />

            {/* Tasks Routes */}
            <Route path={ROUTES.TASKS_OVERVIEW} element={<ProtectedRoute><Layout><TasksPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.TASKS_INFO_REQUESTS} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.TASKS_FLAGGED_ITEMS} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            
            {/* Reports Routes */}
            <Route path={ROUTES.REPORTS} element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.REPORTS_SCHEDULE} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.REPORTS_EXPORT} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            
            {/* Analytics */}
            <Route path={ROUTES.ANALYTICS} element={<ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>} />
            
            {/* Notifications Routes */}
            <Route path={ROUTES.NOTIFICATIONS_OVERVIEW} element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.NOTIFICATIONS_SETTINGS} element={<ProtectedRoute><Layout><NotificationSettingsPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.NOTIFICATIONS_SUSPICIOUS_ACTIVITY} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            
            {/* Team Routes */}
            <Route path={ROUTES.TEAM} element={<ProtectedRoute><Layout><TeamDirectoryPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.TEAM_EDIT_MEMBER} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.TEAM_ROLES} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            
            {/* Settings Routes */}
            <Route path={ROUTES.SETTINGS} element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.SETTINGS_UPDATE_PASSWORD} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.SETTINGS_DELETE_ACCOUNT} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.SETTINGS_REGIONAL} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.SETTINGS_LANGUAGE} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.SETTINGS_PREFERENCES} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.SETTINGS_ACCESS_CONTROLS} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.SETTINGS_CONSENT} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            
            {/* Profile */}
            <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Layout><UserProfilePage /></Layout></ProtectedRoute>} />
            
            {/* Help Routes */}
            <Route path={ROUTES.HELP} element={<ProtectedRoute><Layout><HelpCenterPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.HELP_CONTACT_SUPPORT} element={<ProtectedRoute><Layout><ContactSupportPage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.HELP_REPORT_ISSUE} element={<ProtectedRoute><Layout><ReportIssuePage /></Layout></ProtectedRoute>} />
            <Route path={ROUTES.HELP_MESSAGES} element={<ProtectedRoute><Layout><PlaceholderPage /></Layout></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.WELCOME} replace />} />
          </Routes>
        </HashRouter>
      </SecureAuthProvider>
    </ErrorBoundary>
  );
};

export default App;