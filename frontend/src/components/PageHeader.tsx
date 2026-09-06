import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

export interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  iconShell?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  iconShell = "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-900/25 ring-1 ring-white/20",
  className = "",
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        {Icon && (
          <span className={`hidden sm:flex w-11 h-11 shrink-0 rounded-2xl items-center justify-center text-white ${iconShell}`}>
            <Icon className="w-5 h-5" />
          </span>
        )}
        <div>
          {eyebrow && (
            <span className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <span className="h-px w-6 bg-gradient-to-r from-emerald-500 to-teal-400" />
              {eyebrow}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-3 flex-wrap shrink-0">{children}</div>}
    </motion.div>
  );
};

export default PageHeader;