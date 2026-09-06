import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ToastBanner } from "./components/ToastBanner";
import { NewPrescriptionModal } from "./components/NewPrescriptionModal";
import { AuthSplash } from "./components/AuthSplash";

// Views
import { DashboardView } from "./views/DashboardView";
import { InventoryCatalogueView } from "./views/InventoryCatalogueView";
import { DrugDetailView } from "./views/DrugDetailView";
import { NewInventoryRecordView } from "./views/NewInventoryRecordView";
import { EditInventoryRecordView } from "./views/EditInventoryRecordView";
import { InteractionKnowledgeBaseView } from "./views/InteractionKnowledgeBaseView";
import { InteractionCheckerView } from "./views/InteractionCheckerView";
import { AIPharmacovigilanceView } from "./views/AIPharmacovigilanceView";
import { LiveSensorsView } from "./views/LiveSensorsView";
import { SystemAlertsView } from "./views/SystemAlertsView";
import { OTCInventoryView } from "./views/OTCInventoryView";
import { SystemSettingsView } from "./views/SystemSettingsView";
import { AccountSettingsView } from "./views/AccountSettingsView";
import { AuthView } from "./views/AuthView";
import { LandingView } from "./views/LandingView";
import { BrandLogo } from "./components/BrandLogo";

const Splash: React.FC = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-[#02100b]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-pulse">
        <BrandLogo variant="full" size="lg" />
      </div>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
      </div>
    </div>
  </div>
);

/** Light theme: soft eco gradient (pure CSS). Auth screens: static deep-green
 *  backdrop so only ONE animation layer (EmeraldHorizon) runs there. App views in
 *  dark: static eco ambience. */
const ThemeBackdrop: React.FC = () => {
  const { theme, currentView, isAuthenticated } = useApp();
  const onAuth = !isAuthenticated || currentView === "signin" || currentView === "signup";

  if (theme === "light") {
    return (
      <div className="fixed inset-0 -z-50 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/60">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(13,148,136,0.08),transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-100/30 to-transparent" />
        <div className="seph-aurora absolute -top-24 right-[12%] h-80 w-80 rounded-full bg-teal-400/10 blur-[120px] pointer-events-none" />
        <div
          className="seph-aurora absolute bottom-[-10rem] left-[8%] h-80 w-80 rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none"
          style={{ animationDelay: "-7s" }}
        />
      </div>
    );
  }

  if (onAuth) {
    // Static, GPU-cheap backdrop: no second WebGL context behind the auth EmeraldHorizon.
    return (
      <div className="fixed inset-0 -z-50 bg-[#03130d]">
        <div className="seph-aurora absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div
          className="seph-aurora absolute bottom-[-14rem] right-[-12rem] h-[32rem] w-[32rem] rounded-full bg-teal-500/10 blur-[120px]"
          style={{ animationDelay: "-7s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-50 bg-[#05100b]">
      {/* Static eco ambience shared by every portal view — glowing aurora + depth */}
      <div className="seph-aurora absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div
        className="seph-aurora absolute bottom-[-14rem] right-[-12rem] h-[32rem] w-[32rem] rounded-full bg-teal-500/10 blur-[120px]"
        style={{ animationDelay: "-7s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.07),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_55%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};

/** Simple crossfade view transition: replaces the elaborate portal iris with
 *  a clean, fast fade — still uses the spring easing for a polished feel. */
const PortalOverlay: React.FC = () => {
  const { portalActive } = useApp();
  return (
    <AnimatePresence>
      {portalActive && (
        <motion.div
          key="portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] pointer-events-none bg-[color:var(--surface-panel)]"
        />
      )}
    </AnimatePresence>
  );
};

const MainLayout: React.FC = () => {
  const { currentView, isAuthenticated, isLoading, authSplash, dismissAuthSplash } = useApp();

  if (isLoading && isAuthenticated) {
    return <Splash />;
  }

  // Public area: landing page + auth screens
  if (!isAuthenticated || currentView === "signin" || currentView === "signup") {
    return (
      <>
        <ThemeBackdrop />
        {currentView === "signin" || currentView === "signup" ? <AuthView /> : <LandingView />}
      </>
    );
  }

  return (
    <>
      <ThemeBackdrop />
      <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased relative transition-colors duration-300">
        {/* Top App Bar Header */}
        <Header />

        {/* Main Container: Sidebar + Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Dynamic View Canvas — clean crossfade on navigation */}
          <main className="flex-1 overflow-y-auto bg-transparent relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {currentView === "dashboard" && <DashboardView />}
                {currentView === "inventory" && <InventoryCatalogueView />}
                {currentView === "drug-detail" && <DrugDetailView />}
                {currentView === "new-inventory" && <NewInventoryRecordView />}
                {currentView === "edit-inventory" && <EditInventoryRecordView />}
                {currentView === "interaction-kb" && <InteractionKnowledgeBaseView />}
                {currentView === "interaction-checker" && <InteractionCheckerView />}
                {currentView === "pharmacovigilance" && <AIPharmacovigilanceView />}
                {currentView === "live-sensors" && <LiveSensorsView />}
                {currentView === "alerts" && <SystemAlertsView />}
                {currentView === "otc-inventory" && <OTCInventoryView />}
                {currentView === "settings" && <SystemSettingsView />}
                {currentView === "account-settings" && <AccountSettingsView />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Global Modals & Toasts */}
        <NewPrescriptionModal />
        <ToastBanner />

        {/* Post-login branded reveal */}
        <AnimatePresence>
          {authSplash && <AuthSplash key="splash" onDone={dismissAuthSplash} />}
        </AnimatePresence>
      </div>
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
      <PortalOverlay />
    </AppProvider>
  );
}
