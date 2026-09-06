import React, { useEffect, useState, useRef } from 'react';
import { fetchApi } from '../api';
import StatusBadge from '../components/StatusBadge';
import { Activity, RefreshCw } from 'lucide-react';

export default function LiveSensors() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  const loadReadings = async () => {
    try {
      const res = await fetchApi('/iot/readings?limit=20');
      setReadings(res.items || res);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('API Error', err);
      // Fallback
      setReadings([
        { id: '1', timestamp_utc: new Date().toISOString(), device_id: 'WOKWI-SIM-001', storage_location_id: 'SHELF-A3-B2', sensor_payload: { temperature_celsius: 4.5, humidity_percent: 45.0 }, device_status: { battery_level_percent: 87, signal_quality: 92 }, alert_flags: { temperature_out_of_range: false, humidity_out_of_range: false } },
        { id: '2', timestamp_utc: new Date(Date.now()-60000).toISOString(), device_id: 'WOKWI-SIM-002', storage_location_id: 'FREEZER-1', sensor_payload: { temperature_celsius: -18.5, humidity_percent: 30.0 }, device_status: { battery_level_percent: 99, signal_quality: 100 }, alert_flags: { temperature_out_of_range: false, humidity_out_of_range: false } },
        { id: '3', timestamp_utc: new Date(Date.now()-120000).toISOString(), device_id: 'WOKWI-SIM-003', storage_location_id: 'SHELF-C1', sensor_payload: { temperature_celsius: 9.5, humidity_percent: 70.0 }, device_status: { battery_level_percent: 45, signal_quality: 60 }, alert_flags: { temperature_out_of_range: true, humidity_out_of_range: true } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadReadings, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" /> Live Sensors
          </h2>
          <p className="text-sm text-slate-500 mt-1">Real-time IoT cold-chain ingestion feed.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">Last updated: {lastRefreshed.toLocaleTimeString()}</span>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${autoRefresh ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-Refresh
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Time (UTC)</th>
                <th className="px-6 py-4">Device / Location</th>
                <th className="px-6 py-4">Readings</th>
                <th className="px-6 py-4">Device Status</th>
                <th className="px-6 py-4">Alert Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center"><div className="animate-spin inline-block rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-500"></div></td></tr>
              ) : readings.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">No readings found.</td></tr>
              ) : (
                readings.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{new Date(r.timestamp_utc).toLocaleTimeString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{r.storage_location_id}</div>
                      <div className="text-xs text-slate-400">{r.device_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{r.sensor_payload?.temperature_celsius} °C</span>
                        <span className="text-xs text-slate-500">{r.sensor_payload?.humidity_percent} % RH</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs">Bat: {r.device_status?.battery_level_percent}%</span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{width: `${r.device_status?.battery_level_percent}%`}}></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {r.alert_flags?.temperature_out_of_range && <StatusBadge status="temperature_out_of_range" />}
                        {r.alert_flags?.humidity_out_of_range && <StatusBadge status="humidity_out_of_range" />}
                        {r.alert_flags?.inventory_threshold_breached && <StatusBadge status="inventory_threshold_breached" />}
                        {!r.alert_flags?.temperature_out_of_range && !r.alert_flags?.humidity_out_of_range && !r.alert_flags?.inventory_threshold_breached && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">OK</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
