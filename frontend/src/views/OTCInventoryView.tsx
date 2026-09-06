import React, { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  X,
  Save,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader } from "../components/PageHeader";
import { OTCItem } from "../types";

export const OTCInventoryView: React.FC = () => {
  const { otcItems, addOTCItem, showToast } = useApp();

  const [filter, setFilter] = useState<"All" | "Low Stock" | "Critical">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New OTC form state
  const [newItemName, setNewItemName] = useState("");
  const [newSubCat, setNewSubCat] = useState("Pain Relief");
  const [newStockQty, setNewStockQty] = useState(100);
  const [newLocation, setNewLocation] = useState("Aisle 1, Shelf A");
  const [newExpiry, setNewExpiry] = useState("2026-06-30");
  const [newSupplier, setNewSupplier] = useState("HealthSupplies LLC");

  const filteredItems = otcItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Low Stock" && (item.stockStatus === "Low" || item.stockStatus === "Reorder")) ||
      (filter === "Critical" && item.stockStatus === "Reorder");

    return matchesSearch && matchesFilter;
  });

  const handleCreateOTC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      alert("Please enter an Item Name.");
      return;
    }

    const status: "Good" | "Low" | "Reorder" =
      newStockQty <= 10 ? "Reorder" : newStockQty <= 50 ? "Low" : "Good";

    addOTCItem({
      itemName: newItemName.trim(),
      subCategory: newSubCat,
      stockQty: newStockQty,
      stockStatus: status,
      location: newLocation,
      expiryDate: newExpiry,
      supplier: newSupplier,
    });

    setIsAddModalOpen(false);
    setNewItemName("");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 relative pb-24">
      {/* Title */}
      <PageHeader
        eyebrow="OTC & Consumer"
        icon={ShoppingBag}
        title="OTC Inventory"
        subtitle="Manage over-the-counter stock levels and expiry tracking."
      >
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-900/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add OTC Product</span>
        </button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search OTC inventory by brand, active ingredient, or aisle..."
            className="w-full h-9 pl-10 pr-4 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter("All")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "All"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                : "bg-slate-100 dark:bg-[#0b2418] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#123021]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("Low Stock")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "Low Stock"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilter("Critical")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === "Critical"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            Critical
          </button>
        </div>
      </div>

      {/* Table matching screenshot */}
      <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="seph-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Stock Qty</th>
                <th>Location</th>
                <th>Expiry Date</th>
                <th>Supplier</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  {/* Item Name */}
                  <td>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.itemName}</div>
                    <div className="text-[11px] text-slate-500">{item.subCategory}</div>
                  </td>

                  {/* Stock Qty & status badge */}
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                        {item.stockQty}
                      </span>
                      {item.stockStatus === "Good" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Good
                        </span>
                      ) : item.stockStatus === "Low" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Low
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          Reorder
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location}</span>
                    </div>
                  </td>

                  {/* Expiry Date */}
                  <td className="font-mono text-slate-600 dark:text-slate-400">
                    {item.expiryDate}
                  </td>

                  {/* Supplier */}
                  <td className="text-slate-600 dark:text-slate-400 font-medium">
                    {item.supplier}
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <button
                      onClick={() => showToast(`Stock replenished: +50 units of ${item.itemName}.`, undefined, "success")}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-[#0b2418] hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="seph-table-foot px-4 py-3 flex items-center justify-between text-xs">
          <span>
            Showing <strong>{filteredItems.length}</strong> over-the-counter SKU records
          </span>
          <span className="font-mono text-[11px] text-slate-400">Front-of-store shelf sync</span>
        </div>
      </div>

      {/* Floating "+ New record" Action Button matching screenshot */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-30">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-xl shadow-emerald-950/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ New record</span>
        </button>
      </div>

      {/* Quick Add OTC Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white/60 dark:bg-[#03130c]/60 backdrop-blur-xl rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 dark:border-emerald-500/15 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Add Over-the-Counter Record</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOTC} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg, Loratadine 10mg"
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Subcategory</label>
                  <select
                    value={newSubCat}
                    onChange={(e) => setNewSubCat(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                  >
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Anti-inflammatory">Anti-inflammatory</option>
                    <option value="Allergy Relief">Allergy Relief</option>
                    <option value="Acid Reducer">Acid Reducer</option>
                    <option value="Cough & Cold">Cough & Cold</option>
                    <option value="First Aid">First Aid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Store Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Aisle 3, Shelf B"
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Supplier</label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  placeholder="e.g. PharmaCorp Inc., Global Meds"
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-[#071a11]/50 border border-slate-200 dark:border-[#123021] rounded-xl focus:border-emerald-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#123021] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-[#123021] dark:bg-[#0b2418]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
