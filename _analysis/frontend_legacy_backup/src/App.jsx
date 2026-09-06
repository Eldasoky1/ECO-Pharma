import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import {
  Login,
  Dashboard,
  DrugCatalogue,
  DrugDetail,
  OTCInventory,
  InventoryEdit,
  InventoryNew,
  InteractionKB,
  InteractionChecker,
  AIAnalyzer,
  PVReports,
  LiveSensors,
  Alerts,
  Settings
} from './pages';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Authenticated Routes wrapped in AppShell */}
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="drugs" element={<DrugCatalogue />} />
        <Route path="drugs/:id" element={<DrugDetail />} />
        <Route path="inventory" element={<OTCInventory />} />
        <Route path="inventory/new" element={<InventoryNew />} />
        <Route path="inventory/:id/edit" element={<InventoryEdit />} />
        <Route path="knowledge-base" element={<InteractionKB />} />
        <Route path="checker" element={<InteractionChecker />} />
        <Route path="ai-analyzer" element={<AIAnalyzer />} />
        <Route path="pv-reports" element={<PVReports />} />
        <Route path="sensors" element={<LiveSensors />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
