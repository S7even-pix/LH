import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import LiveMapPage from './pages/LiveMapPage';
import ReportOutagePage from './pages/ReportOutagePage';
import IncidentManagement from './pages/IncidentManagement';
import EscalationCentre from './pages/EscalationCentre';
import AnalyticsPage from './pages/AnalyticsPage';
import { incidentStore, subscribeToStore } from './data/incidentStore';

export default function App() {
  const [storeData, setStoreData] = useState(() => incidentStore.getStore());
  const [currentRole, setCurrentRole] = useState('operator'); // Default to utility operator for hackathon demo

  // Subscribe to storage changes so any action immediately re-renders all components
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setStoreData(incidentStore.getStore());
    });
    return unsubscribe;
  }, []);

  // Periodic SLA check interval (runs every 15 seconds while app is open)
  useEffect(() => {
    // Initial check on load
    incidentStore.triggerSLACheckNow();

    const interval = setInterval(() => {
      incidentStore.triggerSLACheckNow();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fffaf5] text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
        {/* Navigation Bar & Role Switcher */}
        <Navbar
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          storeData={storeData}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route
              path="/"
              element={<Overview storeData={storeData} currentRole={currentRole} />}
            />
            <Route
              path="/map"
              element={<LiveMapPage storeData={storeData} />}
            />
            <Route
              path="/report"
              element={<ReportOutagePage storeData={storeData} />}
            />
            <Route
              path="/incidents"
              element={<IncidentManagement storeData={storeData} />}
            />
            <Route
              path="/escalations"
              element={<EscalationCentre storeData={storeData} />}
            />
            <Route
              path="/analytics"
              element={<AnalyticsPage storeData={storeData} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer with Hackathon & Attribution Notice */}
        <footer className="border-t border-orange-200/80 bg-white/80 text-slate-500 py-6 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">GridGuard</span>
              <span>&bull;</span>
              <span className="text-orange-700 font-semibold">AI for Humanity Track</span>
              <span>&bull;</span>
              <span className="text-orange-600 font-medium">Kerala, India Demonstration Area</span>
            </div>
            <div className="text-slate-500 text-center sm:text-right text-[11px]">
              Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-orange-600">OpenStreetMap</a> contributors.
              <span className="block text-slate-400 mt-0.5">
                Simulated demonstration data. Not affiliated with KSEB or real utility systems.
              </span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
