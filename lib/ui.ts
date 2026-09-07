// Shared interactive styles. These class strings were duplicated across six files
// and had already drifted apart (several copies were missing the focus-visible
// ring), so they live here to keep buttons and links visually consistent.
// Per-site modifiers are appended at the call site, e.g. `${buttonPrimary} w-full`.

export const buttonPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400";

export const buttonSecondary =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:cursor-not-allowed disabled:text-slate-400";

export const linkAccent =
  "text-sm font-semibold text-indigo-700 transition hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

export const surfaceCard =
  "rounded-xl border border-slate-200 bg-white shadow-sm";
