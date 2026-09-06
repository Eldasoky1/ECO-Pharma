import React, { useState } from "react";
import {
  Radio,
  RefreshCw,
  Download,
  AlertTriangle,
  Thermometer,
  Wifi,
  Battery,
  BatteryWarning,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";

export const LiveSensorsView: React.FC = () => {
  const {
    sensors,
    autoRefreshSensors,
    setAutoRefreshSensors,
    refreshSensorReadings,
    showToast,
  } = useApp();

  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  const locations = [
    "All Locations",
    "Cold Storage A",
    "Vaccine Fridge 1",
    "Main Floor",
    "Quarantine Zone",
    "Compounding Lab",
  ];

  const filteredSensors = sensors.filter((s) => {
    if (selectedLocation === "All Locations") return true;
    return s.location === selectedLocation;
  });

  const criticalSensorsCount = sensors.filter(
    (s) => s.status === "High Temp" || s.status === "Low Temp" || s.status === "Low Batt"
  ).length;

  const handleExportCSV = () => {
    const headers = ["Sensor ID", "Location", "Zone", "Temperature (C)", "Humidity (%)", "Battery (%)", "Signal", "Status"];
    const rows = filteredSensors.map((s) => [
      s.id,
      `"${s.location}"`,
      `"${s.zone}"`,
      s.tempC !== null ? s.tempC : "N/A",
      s.humidityPct !== null ? s.humidityPct : "N/A",
      s.batteryPct !== null ? s.batteryPct : "N/A",
      s.signalStrength,
      s.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sensor_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Sensor readings exported to CSV.", undefined, "info");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <PageHeader
        eyebrow="Cold Chain"
        icon={Radio}
        title="Live Sensors"
        subtitle="Real-time environmental monitoring across all storage zones."
      >
        {/* Top Controls: Location Dropdown, Auto-refresh toggle, Manual refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-1.5 bg-white/60 dark:bg-[#0b2418]/70 backdrop-blur border border-slate-200 dark:border-[#123021] rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-600 cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-[#0b2418]/70 backdrop-blur border border-slate-200 dark:border-[#123021] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefreshSensors}
              onChange={(e) => setAutoRefreshSensors(e.target.checked)}
              className="rounded text-emerald-600 accent-emerald-600 w-3.5 h-3.5"
            />
            <span>AUTO-REFRESH</span>
          </label>

          <button
            onClick={refreshSensorReadings}
            className="p-2 bg-white/60 dark:bg-[#0b2418]/70 backdrop-blur border border-slate-200 dark:border-[#123021] hover:border-emerald-500/60 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Poll all sensor nodes immediately"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </PageHeader>

      {/* 4 Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Alerts */}
        <div className="relative rounded-2xl border border-rose-200/80 dark:border-rose-500/30 bg-white/60 dark:bg-[#0a2016]/60 backdrop-blur-xl shadow-xs overflow-hidden flex flex-col justify-between p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 to-orange-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Critical Alerts
            </span>
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-md shadow-rose-900/25">
              <AlertTriangle className="w-4 h-4 text-white" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {criticalSensorsCount}
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-1">
              Requires immediate attention
            </p>
          </div>
          <AlertTriangle className="w-24 h-24 text-rose-200/40 dark:text-rose-500/10 absolute -bottom-6 -right-3 pointer-events-none" />
        </div>

        {/* Active Sensors */}
        <div className="relative rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 bg-white/60 dark:bg-[#0a2016]/60 backdrop-blur-xl shadow-xs overflow-hidden flex flex-col justify-between p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Active Sensors
            </span>
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-900/25">
              <Radio className="w-4 h-4 text-white" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">124</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>99.2% uptime today</span>
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <ArrowUp className="w-3 h-3" />
                +0.4%
              </span>
            </p>
          </div>
        </div>

        {/* Avg Cold Temp */}
        <div className="relative rounded-2xl border border-slate-200/80 dark:border-teal-500/20 bg-white/60 dark:bg-[#0a2016]/60 backdrop-blur-xl shadow-xs overflow-hidden flex flex-col justify-between p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Avg Cold Temp
            </span>
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-900/25">
              <Thermometer className="w-4 h-4 text-white" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">4.2°C</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Target range: 2°C - 8°C</p>
          </div>
        </div>

        {/* Network Hub */}
        <div className="relative rounded-2xl border border-slate-200/80 dark:border-teal-500/20 bg-white/60 dark:bg-[#0a2016]/60 backdrop-blur-xl shadow-xs overflow-hidden flex flex-col justify-between p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Network Hub
            </span>
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-900/25">
              <Wifi className="w-4 h-4 text-white" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Stable</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              Latency: 12ms
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Readings Feed Table */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Sensor Readings Feed
            </h2>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
              LIVE
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418] text-slate-700 dark:text-slate-300 border border-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="seph-table">
            <thead>
              <tr>
                <th>Sensor ID</th>
                <th>Location</th>
                <th>Temp (°C)</th>
                <th>Humidity (%)</th>
                <th>Battery</th>
                <th>Signal</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSensors.map((sensor) => {
                const isHighTemp = sensor.status === "High Temp";
                const isLowBatt = sensor.status === "Low Batt";
                const isOffline = sensor.status === "Offline";

                return (
                  <tr key={sensor.id}>
                    {/* Sensor ID */}
                    <td className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {sensor.id}
                    </td>

                    {/* Location */}
                    <td className="text-slate-700 dark:text-slate-300 font-medium">
                      {sensor.location}
                    </td>

                    {/* Temp */}
                    <td className="font-bold">
                      {sensor.tempC !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isHighTemp ? "text-rose-600" : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {sensor.tempC}°C
                          {isHighTemp ? (
                            <ArrowUp className="w-3.5 h-3.5 text-rose-600" />
                          ) : (
                            <span className="text-[10px] text-slate-400">±</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">--</span>
                      )}
                    </td>

                    {/* Humidity */}
                    <td className="text-slate-600 dark:text-slate-400">
                      {sensor.humidityPct !== null ? `${sensor.humidityPct}%` : "--"}
                    </td>

                    {/* Battery */}
                    <td>
                      {sensor.batteryPct !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-[#0b2418] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isLowBatt ? "bg-rose-500" : "bg-emerald-600"
                              }`}
                              style={{ width: `${sensor.batteryPct}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              isLowBatt ? "text-rose-600" : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {sensor.batteryPct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">--</span>
                      )}
                    </td>

                    {/* Signal */}
                    <td>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        <Wifi className="w-3.5 h-3.5 text-slate-400" />
                        {sensor.signalStrength}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="text-right">
                      {isHighTemp ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          High Temp
                        </span>
                      ) : isLowBatt ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <BatteryWarning className="w-3 h-3" />
                          Low Batt
                        </span>
                      ) : isOffline ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-[#0b2418] text-slate-500 border border-slate-200">
                          Offline
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Stable
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="seph-table-foot px-4 py-3 flex items-center justify-between text-xs">
          <span>Storage zone sensors calibrated under NIST traceable standards.</span>
          <span className="text-[11px] font-mono text-slate-400">Gateway: Zigbee / BLE Mesh #GW-88</span>
        </div>
      </div>
    </div>
  );
};
