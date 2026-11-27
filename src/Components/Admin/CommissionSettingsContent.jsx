"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  DollarSign,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Lock,
  Layers,
  ShieldCheck,
  RefreshCw,
  Info,
} from "lucide-react";
import { getCommissionModels, updateCommissionModel } from "../../services/CommissionService";
import notify from "../../utils/notify";

const defaultModelsFallback = [
  {
    id: 1,
    modelCode: "MODEL_A",
    name: "Buyer Convenience Fee",
    description: "Organizer receives 100% of ticket face value. An online convenience fee is charged directly to the ticket buyer (inclusive of gateway processing).",
    buyerFeePercent: 6.5,
    organizerCommissionPercent: 0.0,
    isActive: true,
  },
  {
    id: 2,
    modelCode: "MODEL_B",
    name: "Split Fee",
    description: "Balanced hybrid model: A modest buyer convenience fee is added at checkout, and a small platform facilitation fee is deducted from organizer disbursements.",
    buyerFeePercent: 4.0,
    organizerCommissionPercent: 3.0,
    isActive: false,
  },
  {
    id: 3,
    modelCode: "MODEL_C",
    name: "Organizer-Only Fee",
    description: "Zero convenience fee for ticket buyers (promotes highest cart conversions). An all-inclusive platform facilitation commission is deducted from gross event proceeds.",
    buyerFeePercent: 0.0,
    organizerCommissionPercent: 8.0,
    isActive: false,
  },
];

export default function CommissionSettingsContent() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Local editable form values per model: { [modelCode]: { buyerFee, organizerComm } }
  const [editValues, setEditValues] = useState({});

  // Sample Ticket Calculator state
  const [sampleTicketPrice, setSampleTicketPrice] = useState(2000);
  const [sampleTicketQty, setSampleTicketQty] = useState(1);

  // Helper to determine active state supporting both isActive and active flags
  const isModelActive = (m) => Boolean(m?.isActive ?? m?.active);

  // Fetch models from backend
  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await getCommissionModels();
      if (res?.data && res.data.length > 0) {
        const normalized = res.data.map((m) => ({
          ...m,
          isActive: isModelActive(m),
          active: isModelActive(m),
        }));
        setModels(normalized);
        initEditValues(normalized);
      } else {
        setModels(defaultModelsFallback);
        initEditValues(defaultModelsFallback);
      }
    } catch (err) {
      console.warn("Could not load backend commission models, using defaults:", err);
      setModels(defaultModelsFallback);
      initEditValues(defaultModelsFallback);
    } finally {
      setLoading(false);
    }
  };

  const initEditValues = (modelList) => {
    const vals = {};
    modelList.forEach((m) => {
      vals[m.modelCode] = {
        buyerFeePercent: m.buyerFeePercent != null ? Number(m.buyerFeePercent) : 0,
        organizerCommissionPercent: m.organizerCommissionPercent != null ? Number(m.organizerCommissionPercent) : 0,
      };
    });
    setEditValues(vals);
  };

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Input Changes for a specific model
  const handleInputChange = (modelCode, field, value) => {
    const num = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setEditValues((prev) => ({
      ...prev,
      [modelCode]: {
        ...prev[modelCode],
        [field]: num,
      },
    }));
  };

  // Handle Model Activation (Enabling one disables all others)
  const handleActivateModel = async (targetModel) => {
    if (isModelActive(targetModel)) return; // already active
    setSavingId(targetModel.id);

    // Optimistic UI update
    const previousModels = [...models];
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        isActive: m.id === targetModel.id,
        active: m.id === targetModel.id,
      }))
    );

    try {
      const currentValues = editValues[targetModel.modelCode] || {};
      const payload = {
        isActive: true,
        active: true,
        buyerFeePercent: currentValues.buyerFeePercent,
        organizerCommissionPercent: currentValues.organizerCommissionPercent,
      };

      await updateCommissionModel(targetModel.id, payload);
      notify.success(`Active commission model switched to ${targetModel.name} (${targetModel.modelCode})`);
      await fetchModels();
    } catch (err) {
      console.error("Failed to activate model:", err);
      notify.apiError(err, "Failed to switch active commission model.");
      setModels(previousModels); // revert on error
    } finally {
      setSavingId(null);
    }
  };

  // Handle Saving Percentage Changes for a Model
  const handleSaveModel = async (model) => {
    setSavingId(model.id);
    try {
      const currentValues = editValues[model.modelCode] || {};
      const payload = {
        buyerFeePercent: currentValues.buyerFeePercent,
        organizerCommissionPercent: currentValues.organizerCommissionPercent,
      };

      await updateCommissionModel(model.id, payload);
      notify.success(`Updated fee rates for ${model.name}`);
      await fetchModels();
    } catch (err) {
      console.error("Failed to update commission rates:", err);
      notify.apiError(err, "Could not save commission adjustments.");
    } finally {
      setSavingId(null);
    }
  };

  // Currently Active Model
  const activeModel = models.find((m) => isModelActive(m)) || models[0] || defaultModelsFallback[0];
  const activeCode = activeModel.modelCode;
  const activeFees = editValues[activeCode] || {
    buyerFeePercent: Number(activeModel.buyerFeePercent),
    organizerCommissionPercent: Number(activeModel.organizerCommissionPercent),
  };

  // Live Calculator Calculations
  const grossTicketFaceValue = (parseFloat(sampleTicketPrice) || 0) * (parseInt(sampleTicketQty, 10) || 1);
  const buyerFeeAmount = (grossTicketFaceValue * (activeFees.buyerFeePercent || 0)) / 100;
  const buyerTotalPaid = grossTicketFaceValue + buyerFeeAmount;

  const organizerCommAmount = (grossTicketFaceValue * (activeFees.organizerCommissionPercent || 0)) / 100;
  const organizerReceives = grossTicketFaceValue - organizerCommAmount;

  const estimatedGatewayFee = (buyerTotalPaid * 3.3) / 100;
  const totalPlatformGrossFee = buyerFeeAmount + organizerCommAmount;
  const estimatedNetPlatformProfit = totalPlatformGrossFee - estimatedGatewayFee;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#14141e] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-[#FED800]">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                Commission & Fee Management
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FED800]/20 text-amber-700 dark:text-[#FED800] border border-amber-400/40">
                ADMIN GOVERNANCE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select and adjust dynamic revenue sharing models between ticket buyers, theatre partners, and Naataka LK.
            </p>
          </div>
        </div>

        <button
          onClick={fetchModels}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Rates</span>
        </button>
      </div>

      {/* Financial Safeguard Banner */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
          <strong className="text-blue-950 dark:text-blue-300 font-bold">Rate Snapshotting Financial Safeguard Active: </strong>
          When a patron completes a booking, the currently enabled fee rates and net payout values are immutably snapshotted onto the booking ledger. Modifying commission settings here will govern all <em>future</em> ticket sales without retroactively altering historical financial settlements.
        </div>
      </div>

      {/* 3 Commission Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => {
          const isModelA = model.modelCode === "MODEL_A";
          const isModelC = model.modelCode === "MODEL_C";

          const currentVals = editValues[model.modelCode] || {
            buyerFeePercent: Number(model.buyerFeePercent),
            organizerCommissionPercent: Number(model.organizerCommissionPercent),
          };

          const isCurrentActive = isModelActive(model);

          return (
            <div
              key={model.id}
              className={`rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between relative ${
                isCurrentActive
                  ? "bg-amber-50/60 dark:bg-gradient-to-b dark:from-[#171b26] dark:to-[#14141e] border-2 border-amber-500 dark:border-[#FED800] shadow-xl shadow-amber-500/10"
                  : "bg-white dark:bg-[#14141e] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none"
              }`}
            >
              {/* Active Glow Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                  {model.modelCode}
                </span>
                {isCurrentActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACTIVE MODEL</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                    Standby
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{model.name}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[48px]">
                  {model.description}
                </p>
              </div>

              {/* Interactive Radio/Toggle Enable Bar */}
              <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-800 dark:text-slate-300 font-semibold block">Enable this Model</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-500">
                    {isCurrentActive ? "Currently powering checkout" : "Click switch to activate"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleActivateModel(model)}
                  disabled={isCurrentActive || savingId === model.id}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer disabled:cursor-default ${
                    isCurrentActive ? "bg-amber-500 dark:bg-[#FED800]" : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                  }`}
                  aria-label={`Enable ${model.name}`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white dark:bg-black shadow-md transform transition-transform ${
                      isCurrentActive ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Fee Percentage Inputs */}
              <div className="space-y-4 mb-6 pt-2 border-t border-slate-200 dark:border-white/10">
                {/* Buyer Convenience Fee */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Buyer Convenience Fee (%)</span>
                    </label>
                    {isModelC && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked at 0%
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      disabled={isModelC}
                      value={isModelC ? 0 : currentVals.buyerFeePercent}
                      onChange={(e) => handleInputChange(model.modelCode, "buyerFeePercent", e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        isModelC
                          ? "bg-slate-100 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                          : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-[#FED800] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#FED800] outline-none"
                      }`}
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>

                {/* Organizer Commission */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Organizer Commission (%)</span>
                    </label>
                    {isModelA && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked at 0%
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      disabled={isModelA}
                      value={isModelA ? 0 : currentVals.organizerCommissionPercent}
                      onChange={(e) =>
                        handleInputChange(model.modelCode, "organizerCommissionPercent", e.target.value)
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        isModelA
                          ? "bg-slate-100 dark:bg-black/30 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                          : "bg-white dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-[#FED800] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#FED800] outline-none"
                      }`}
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveModel(model)}
                  disabled={savingId === model.id}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-200 dark:border-transparent text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {savingId === model.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Profit Preview Calculator */}
      <div className="bg-white dark:bg-[#14141e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Live Profit Preview Calculator</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  REFLECTING {activeModel.modelCode}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate gross transactions and net cash flow outcomes under the currently active commission rules.
              </p>
            </div>
          </div>

          {/* Calculator Inputs */}
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                Sample Ticket (LKR)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={sampleTicketPrice}
                onChange={(e) => setSampleTicketPrice(e.target.value)}
                className="w-28 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-[#FED800] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                Qty
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={sampleTicketQty}
                onChange={(e) => setSampleTicketQty(e.target.value)}
                className="w-16 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-[#FED800] outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4 Outcome Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* 1. Buyer Pays */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Buyer Pays (Total)</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              LKR {buyerTotalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Ticket Face (LKR {grossTicketFaceValue.toLocaleString()}) + {activeFees.buyerFeePercent}% Fee (LKR {buyerFeeAmount.toLocaleString()})
            </div>
          </div>

          {/* 2. Organizer Receives */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Organizer Receives (Net Payout)</div>
            <div className="text-xl font-extrabold text-amber-600 dark:text-[#FED800]">
              LKR {organizerReceives.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Ticket Face - {activeFees.organizerCommissionPercent}% Commission (LKR {organizerCommAmount.toLocaleString()})
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estimated IPG Processing Fee</div>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              - LKR {estimatedGatewayFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Est. 3.30% of total charged from buyer (LKR {buyerTotalPaid.toLocaleString()})
            </div>
          </div>

          {/* 4. Estimated Net Platform Profit */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 space-y-1">
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Estimated Net Platform Profit</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              LKR {estimatedNetPlatformProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
              Net margin after payment gateway interchange
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
