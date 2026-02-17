import { useState, useCallback, useEffect } from "react";

export interface IntentStepType {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
  description?: string;
}

const INTENT_STEPS_DATA = [
  { id: "accepted", name: "Intent Accepted", description: "Transaction has been accepted" },
  { id: "signed", name: "Intent Hash Signed", description: "Hash signature in progress" },
  { id: "submitted", name: "Intent Submitted", description: "Submitting to the network" },
  { id: "collection", name: "Intent Collection", description: "Collecting transaction data" },
  { id: "mined", name: "Intent Mined", description: "Mining transaction on chain" },
  { id: "confirmed", name: "Intent Deposits Confirmed", description: "Confirming deposits" },
  { id: "fulfilled", name: "Intent Fulfilled", description: "Transaction complete" }
];

export const useIntentProgress = () => {
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const startProgress = useCallback(() => {
    setIsProgressVisible(true);
    setCurrentStep(0);
    setIsCompleted(false);
  }, []);

  const updateStep = useCallback((step: number) => {
    if (step >= 0 && step < INTENT_STEPS_DATA.length) {
      setCurrentStep(step);
      if (step === INTENT_STEPS_DATA.length - 1) {
        setIsCompleted(true);
      }
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, INTENT_STEPS_DATA.length - 1);
      if (next === INTENT_STEPS_DATA.length - 1) {
        setIsCompleted(true);
      }
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setIsProgressVisible(false);
    setCurrentStep(0);
    setIsCompleted(false);
  }, []);

  const hideProgress = useCallback(() => {
    setIsProgressVisible(false);
  }, []);

  // Map transaction states to intent steps
  const mapTransactionState = useCallback((state: string) => {
    const stateToStep: { [key: string]: number } = {
      'initiated': 0,
      'signed': 1,
      'submitted': 2,
      'processing': 3,
      'mining': 4,
      'confirming': 5,
      'completed': 6,
      'success': 6
    };
    
    return stateToStep[state.toLowerCase()] ?? 0;
  }, []);

  return {
    isProgressVisible,
    currentStep,
    isCompleted,
    startProgress,
    updateStep,
    nextStep,
    resetProgress,
    hideProgress,
    mapTransactionState,
    steps: INTENT_STEPS_DATA,
    progressPercentage: (currentStep / (INTENT_STEPS_DATA.length - 1)) * 100
  };
};
