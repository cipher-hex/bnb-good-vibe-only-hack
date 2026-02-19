"use client";

import React from "react";
import { ContractTemplate } from "@/types/bridge-execute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selectedTemplate: ContractTemplate | null;
  className?: string;
  disabled?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  className,
  disabled = false,
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
      case "high":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-secondary text-secondary-foreground border-secondary";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "lending":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "staking":
        return "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30";
      case "defi":
        return "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30";
      default:
        return "bg-secondary text-secondary-foreground border-secondary";
    }
  };

  if (!selectedTemplate) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">
          No protocols available for the selected chain and token.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try selecting a different chain or token.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 select-none", className)}>
      <div className="grid grid-cols-1 gap-3">
        <Card
          className={cn(
            "cursor-pointer transition-all duration-200 bg-card gap-y-0 border-border shadow-sm",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        >
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-lg flex flex-col gap-y-2 text-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getCategoryColor(selectedTemplate.category),
                          )}
                        >
                          {selectedTemplate.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getRiskColor(selectedTemplate.riskLevel),
                          )}
                        >
                          {selectedTemplate.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                    {selectedTemplate.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {selectedTemplate.description}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mt-2">
              {selectedTemplate.expectedOutcome}
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                size="sm"
                className="w-full rounded-full bg-muted text-primary shadow-sm border border-border hover:bg-accent"
              >
                Selected ✓
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplateSelector;
