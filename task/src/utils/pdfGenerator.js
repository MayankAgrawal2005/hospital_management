import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePrescriptionPDF = (prescription) => {
  const doc = new jsPDF();
  const { doctorId, patientId, medicines, notes, suggestedTests, createdAt } = prescription;

  // Header - Hospital Name
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text("CareSync 360 Medical Center", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Modern Healthcare Excellence | https://caresync360.com", 105, 28, { align: "center" });

  // Divider
  doc.setDrawColor(200);
  doc.line(20, 35, 190, 35);

  // Doctor & Patient Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("DOCTOR:", 20, 45);
  doc.setFont("helvetica", "normal");
  doc.text(`Dr. ${doctorId?.name || "N/A"}`, 50, 45);
  doc.text(`${doctorId?.specialization || "General Physician"}`, 50, 50);

  doc.setFont("helvetica", "bold");
  doc.text("PATIENT:", 120, 45);
  doc.setFont("helvetica", "normal");
  doc.text(`${patientId?.name || "N/A"}`, 150, 45);
  doc.text(`${patientId?.email || ""}`, 150, 50);

  doc.setFont("helvetica", "bold");
  doc.text("DATE:", 20, 65);
  doc.setFont("helvetica", "normal");
  doc.text(`${new Date(createdAt).toLocaleDateString()}`, 50, 65);

  // Medicines Table
  autoTable(doc, {
    startY: 75,
    head: [['Medicine Name', 'Dosage', 'Duration', 'Instruction']],
    body: medicines.map(m => [m.name, m.dosage, m.duration, m.instruction || "-"]),
    headStyles: { fillColor: [37, 99, 235] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 20, right: 20 }
  });

  const finalY = (doc.lastAutoTable?.finalY || 150) + 15;

  // Notes/Advice
  doc.setFont("helvetica", "bold");
  doc.text("Advice & Notes:", 20, finalY);
  doc.setFont("helvetica", "normal");
  const splitNotes = doc.splitTextToSize(notes || "No additional notes.", 170);
  doc.text(splitNotes, 20, finalY + 7);

  // Suggested Tests
  if (suggestedTests) {
    const testY = finalY + (splitNotes.length * 7) + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Suggested Tests:", 20, testY);
    doc.setFont("helvetica", "normal");
    doc.text(suggestedTests, 20, testY + 7);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("This is a digitally generated prescription from CareSync 360.", 105, pageHeight - 15, { align: "center" });
  doc.text("Please consult with your doctor before following the above medication.", 105, pageHeight - 10, { align: "center" });

  // Save
  doc.save(`Prescription_${patientId?.name}_${new Date().getTime()}.pdf`);
};
