import { motion } from "framer-motion";

export default function ReportPreviewModal({ report, onClose }) {
  if (!report) return null;

  const isPDF = report.fileUrl.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-slate-900 w-full h-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{report.reportName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{report.reportType} • {new Date(report.date).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-4 items-center">
            <a 
              href={report.fileUrl} 
              download 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all"
            >
              Download
            </a>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-light">&times;</button>
          </div>
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
          {isPDF ? (
            <iframe 
              src={report.fileUrl} 
              className="w-full h-full border-none"
              title="Report Preview"
            />
          ) : (
            <img 
              src={report.fileUrl} 
              alt={report.reportName} 
              className="max-w-full max-h-full object-contain p-4"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
