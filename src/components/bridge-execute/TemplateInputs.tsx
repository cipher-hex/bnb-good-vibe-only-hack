"use client";

import React from "react";
import { TemplateInputField, ContractTemplate } from "@/types/bridge-execute";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateInputsProps {
  template: ContractTemplate;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  className?: string;
}

const TemplateInput: React.FC<{
  field: TemplateInputField;
  value: string;
  onChange: (value: string) => void;
}> = ({ field, value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const renderInput = () => {
    switch (field.type) {
      case "select":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="shadow-sm rounded-xl border-input bg-background">
              <SelectValue
                placeholder={field.placeholder || `Select ${field.label}`}
              />
            </SelectTrigger>
            <SelectContent className="bg-popover rounded-xl border border-border">
              {field.options?.map((option, index) => (
                <SelectItem
                  key={`${option.value}-${index}`}
                  value={option.value}
                  className="rounded-lg focus:bg-accent focus:text-accent-foreground cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "address":
        return (
          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={field.placeholder || "0x..."}
            className="border-input bg-background focus-visible:ring-1 focus-visible:ring-ring shadow-sm rounded-xl"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className="border-input bg-background focus-visible:ring-1 focus-visible:ring-ring shadow-sm rounded-xl"
          />
        );

      default: // 'text'
        return (
          <Input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            pattern={field.validation?.pattern}
            className="border-input bg-background focus-visible:ring-1 focus-visible:ring-ring shadow-sm rounded-xl"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {renderInput()}
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
};

const TemplateInputs: React.FC<TemplateInputsProps> = ({
  template,
  values,
  onChange,
  showAdvanced,
  onToggleAdvanced,
  className,
}) => {
  const requiredFields = template.inputFields.filter((field) => field.required);
  const optionalFields = template.inputFields.filter(
    (field) => !field.required,
  );

  if (template.inputFields.length === 0) {
    return (
      <div className={cn("text-center py-4 text-muted-foreground", className)}>
        <p className="text-sm">
          No additional parameters required for this protocol.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Required Fields */}
      {requiredFields.map((field, index) => (
        <TemplateInput
          key={`required-${field.name}-${index}`}
          field={field}
          value={values[field.name] || ""}
          onChange={(value) => onChange(field.name, value)}
        />
      ))}

      {/* Optional Fields - Advanced Section */}
      {optionalFields.length > 0 && (
        <div className="space-y-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleAdvanced}
            className="flex items-center gap-2 text-sm p-0 h-auto hover:bg-transparent"
          >
            {showAdvanced ? (
              <>
                Hide Advanced Options
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Advanced Options
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>

          {showAdvanced && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {optionalFields.map((field, index) => (
                <TemplateInput
                  key={`optional-${field.name}-${index}`}
                  field={field}
                  value={values[field.name] || ""}
                  onChange={(value) => onChange(field.name, value)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateInputs;
