import React from "react";
import { Progress } from "../ui/progress";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

export interface IntentStep {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
  description?: string;
}

const INTENT_STEPS: IntentStep[] = [
  { id: "accepted", name: "Intent Accepted", status: "pending", description: "Transaction has been accepted" },
  { id: "signed", name: "Intent Hash Signed", status: "pending", description: "Hash signature in progress" },
  { id: "submitted", name: "Intent Submitted", status: "pending", description: "Submitting to the network" },
  { id: "collection", name: "Intent Collection", status: "pending", description: "Collecting transaction data" },
  { id: "mined", name: "Intent Mined", status: "pending", description: "Mining transaction on chain" },
  { id: "confirmed", name: "Intent Deposits Confirmed", status: "pending", description: "Confirming deposits" },
  { id: "fulfilled", name: "Intent Fulfilled", status: "pending", description: "Transaction complete" }
];

interface IntentProgressProps {
  currentStep: number;
  isVisible: boolean;
  onClose?: () => void;
}

export default function IntentProgress({ currentStep, isVisible, onClose }: IntentProgressProps) {
  if (!isVisible) return null;

  const progressPercentage = (currentStep / INTENT_STEPS.length) * 100;
  
  const steps = INTENT_STEPS.map((step, index) => ({
    ...step,
    status: index < currentStep ? "completed" : index === currentStep ? "in-progress" : "pending"
  }));

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl p-6 min-w-[400px] border border-[#E1ECF7]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#1E293B]">Transaction Progress</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-[#64748B] mt-2">{Math.round(progressPercentage)}% Complete</p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="mt-0.5">
              {step.status === "completed" ? (
                <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              ) : step.status === "in-progress" ? (
                <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-[#CBD5E1]" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                step.status === "completed" ? "text-[#22C55E]" :
                step.status === "in-progress" ? "text-[#2563EB]" :
                "text-[#94A3B8]"
              }`}>
                {step.name}
              </p>
              {step.status === "in-progress" && step.description && (
                <p className="text-xs text-[#64748B] mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#E1ECF7]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#64748B]">Estimated time remaining:</span>
          <span className="text-[#1E293B] font-medium">~{Math.max(1, (7 - currentStep) * 15)} seconds</span>
        </div>
      </div>
    </div>
  );
}
