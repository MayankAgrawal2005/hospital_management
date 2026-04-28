import { motion } from "framer-motion";

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 mb-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 object-contain w-full animate-pulse border border-slate-100 dark:border-slate-700/50">
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="w-1/4 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col p-6 rounded-3xl bg-white dark:bg-slate-800 animate-pulse border border-slate-100 dark:border-slate-700 shadow-sm w-full mx-auto">
      <div className="flex items-start gap-4 w-full">
        <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex flex-col gap-3 flex-1 mb-8">
          <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
      <div className="w-full h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full">
      {[1, 2, 3, 4].map((i) => (
         <div key={i} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl animate-pulse h-28 border border-slate-100 dark:border-slate-700/50">
           <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 mb-2 rounded" />
           <div className="w-1/3 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
         </div>
      ))}
    </div>
  );
}
