import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function PrescriptionForm({ appointmentId, onClose, onSave }) {
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "", instruction: "After Food" }]);
  const [notes, setNotes] = useState("");
  const [suggestedTests, setSuggestedTests] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchExisting();
  }, [appointmentId]);

  const fetchExisting = async () => {
    try {
      const res = await API.get(`/prescriptions/appointment/${appointmentId}`);
      if (res.data) {
        setMedicines(res.data.medicines || [{ name: "", dosage: "", duration: "", instruction: "After Food" }]);
        setNotes(res.data.notes || "");
        setSuggestedTests(res.data.suggestedTests || "");
      }
    } catch (err) {
      // No prescription yet, that's fine
    } finally {
      setFetching(false);
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", duration: "", instruction: "After Food" }]);
  };

  const removeMedicine = (index) => {
    const newMeds = medicines.filter((_, i) => i !== index);
    setMedicines(newMeds.length ? newMeds : [{ name: "", dosage: "", duration: "", instruction: "After Food" }]);
  };

  const updateMedicine = (index, field, value) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const handleSubmit = async (status) => {
    if (!notes.trim()) return toast.error("Please add some notes/advice");
    if (medicines.some(m => !m.name.trim() || !m.dosage.trim())) {
      return toast.error("Please fill medicine details");
    }

    setLoading(true);
    try {
      await API.post("/prescriptions", {
        appointmentId,
        medicines,
        notes,
        suggestedTests,
        status
      });
      toast.success(`Prescription saved as ${status}`);
      if (onSave) onSave();
      onClose();
    } catch (err) {
      toast.error("Failed to save prescription");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Write Prescription</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Medicines</label>
          <div className="space-y-3">
            {medicines.map((med, index) => (
              <div key={index} className="flex gap-2 items-start bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex-1 space-y-2">
                  <input
                    placeholder="Medicine Name"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                    value={med.name}
                    onChange={(e) => updateMedicine(index, "name", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Dosage (e.g. 1-0-1)"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                    />
                    <input
                      placeholder="Duration (e.g. 5 days)"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                      value={med.duration}
                      onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                    />
                  </div>
                  <select
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
                    value={med.instruction}
                    onChange={(e) => updateMedicine(index, "instruction", e.target.value)}
                  >
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                    <option value="At Bedtime">At Bedtime</option>
                    <option value="Morning Only">Morning Only</option>
                    <option value="Night Only">Night Only</option>
                    <option value="SOS (If needed)">SOS (If needed)</option>
                  </select>
                </div>
                <button 
                  onClick={() => removeMedicine(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              onClick={addMedicine}
              className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 font-bold text-sm hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              + Add Another Medicine
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Advice / Notes</label>
          <textarea
            rows="3"
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
            placeholder="Dietary advice, next steps..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Suggested Tests (Optional)</label>
          <input
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
            placeholder="Blood test, X-ray..."
            value={suggestedTests}
            onChange={(e) => setSuggestedTests(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={() => handleSubmit("draft")}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSubmit("final")}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Finalize & Send"}
        </button>
      </div>
    </div>
  );
}
