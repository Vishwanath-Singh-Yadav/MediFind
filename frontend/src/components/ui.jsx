import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

export function Button({ className, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:opacity-90 shadow-md shadow-teal-500/20 active:translate-y-[1px]",
    secondary: "bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700/80 active:translate-y-[1px]",
    ghost: "hover:bg-white/5 text-slate-400 hover:text-white",
    danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:opacity-90 shadow-md shadow-rose-500/20 active:translate-y-[1px]",
    outline: "border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 active:translate-y-[1px]"
  };
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-2xl backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 transition focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-slate-200 outline-none transition focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        "text-xs font-bold uppercase tracking-wider text-slate-500",
        className
      )}
      {...props}
    />
  );
}

export function Badge({ className, tone = "neutral", ...props }) {
  const tones = {
    neutral: "bg-slate-800/80 text-slate-400 border border-slate-700/60",
    good: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warn: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    bad: "bg-rose-500/10 text-rose-400 border border-rose-500/20"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function EmptyState({ title, text, icon: Icon }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 p-6 text-center">
      {Icon ? <Icon className="mb-4 h-10 w-10 text-slate-600" /> : null}
      <h3 className="text-base font-bold text-slate-300">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-500 leading-relaxed">{text}</p>
    </div>
  );
}
