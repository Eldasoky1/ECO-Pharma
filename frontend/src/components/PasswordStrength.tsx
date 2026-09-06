import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { evaluatePassword, PASSWORD_RULES } from "../utils/password";

const SEGMENT_COLORS: Record<number, string> = {
  0: "bg-red-500",
  1: "bg-red-400",
  2: "bg-amber-400",
  3: "bg-lime-500",
  4: "bg-emerald-500",
};

const LABEL_CLASS: Record<number, string> = {
  0: "text-red-500 dark:text-red-400",
  1: "text-red-400 dark:text-red-400",
  2: "text-amber-500 dark:text-amber-400",
  3: "text-lime-600 dark:text-lime-400",
  4: "text-emerald-600 dark:text-emerald-400",
};

interface PasswordStrengthProps {
  password: string;
  showRules?: boolean;
}

/** Small color-coded strength bar + optional rule checklist under a password input. */
export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, showRules = true }) => {
  const { score, label, missing, meetsAll } = evaluatePassword(password);

  if (!password) return null;

  return (
    <div className="mt-2 ml-1">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2, 3].map((segment) => (
            <div
              key={segment}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                segment < score ? SEGMENT_COLORS[score] : "bg-slate-200 dark:bg-white/10"
              }`}
            />
          ))}
        </div>
        {label && (
          <span className={`text-[10px] font-bold uppercase tracking-wider ${LABEL_CLASS[score]}`}>{label}</span>
        )}
      </div>

      {showRules && !meetsAll && (
        <ul className="mt-2 space-y-1">
          {PASSWORD_RULES.map((rule) => {
            const ok = !missing.some((m) => m.key === rule.key);
            return (
              <li key={rule.key} className="flex items-center gap-1.5 text-[10px] font-medium">
                {ok ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Circle className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                )}
                <span className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                  {rule.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};