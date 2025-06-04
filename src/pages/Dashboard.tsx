import React, { useEffect, useState, ChangeEvent } from "react";
import { Users, Check, Award } from "lucide-react";
import KPICard from "../components/dashboard/KPICard";
import LeadsTable from "../components/dashboard/LeadsTable";
import { Lead, KPI } from "../types";
import { syncLeadsFromSheets, fetchLeadsFromFirestore, importLeadsFromCSV  } from "../services/api";
import { exportToCSV } from "../utils/exportCsv";
import axios from "axios";
import Papa from "papaparse";

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch from Firestore first (no API_URL involved)
        const initial = await fetchLeadsFromFirestore();
        setLeads(initial);
        computeKPIs(initial);

        // 2️⃣ Then sync with Sheets in background
        await syncLeadsFromSheets();

        // 3️⃣ Re-fetch updated Firestore data
        const updated = await fetchLeadsFromFirestore();
        setLeads(updated);
        computeKPIs(updated);
      } catch (err: unknown) {
        console.error("Error loading leads:", err);
        if (axios.isAxiosError(err) && err.response?.status === 500) {
          setWarning("No leads available for your account");
        } else if (err instanceof Error) {
          setError("Failed to load leads: " + err.message);
        } else {
          setError("Failed to load leads due to an unknown error");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);




  // New CSV import handler
  const handleCSVImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // setImportLoading(true);
    setImportError("");
    
    try {
      const file = files[0];
      const text = await readFileAsText(file);
      const leads = parseCSV(text);
      
      await importLeadsFromCSV(leads);
      
      // Refresh leads after import
      const updatedLeads = await fetchLeadsFromFirestore();
      setLeads(updatedLeads);
      computeKPIs(updatedLeads);
      
      setShowPopup(false);
    } catch (err: unknown) {
      console.error("CSV import error:", err);
      if (err instanceof Error) {
        setImportError(err.message || "Failed to import CSV");
      } else {
        setImportError("Failed to import CSV");
      }
    } finally {
      // setImportLoading(false);
      e.target.value = ""; // Reset input
    }
  };

  // Helper to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsText(file);
    });
  };

  // Parse CSV text into Lead objects
  const parseCSV = (csvText: string): Lead[] => {
    interface ParseResult<T> {
      data: T[];
      errors: Papa.ParseError[];
      meta: Papa.ParseMeta;
    }

    const results: ParseResult<CSVRow> = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });
    
    if (results.errors.length > 0) {
      throw new Error("Invalid CSV format");
    }
    
    interface CSVRow {
      created_time?: string;
      platform?: string;
      name?: string;
      whatsapp_number_?: string;
      lead_status?: string;
      comments?: string;
    }

    return results.data.map((row: CSVRow, index: number): Lead => ({
      id: `imported-${Date.now()}-${index}`, // Temporary ID
      created_time: row.created_time || new Date().toISOString(),
      platform: row.platform || "",
      name: row.name || "",
      whatsapp_number_: row.whatsapp_number_ || "",
      lead_status: row.lead_status || "New Lead",
      comments: row.comments || "",
    }));
  };







  // Add useEffect to recalculate KPIs when leads change
  useEffect(() => {
    computeKPIs(leads);
  }, [leads]); // This will trigger whenever leads array changes

  const computeKPIs = (list: Lead[]) => {
    const meetingDone = list.filter(
      (l) => l.lead_status === "Meeting Done"
    ).length;
    const dealDone = list.filter((l) => l.lead_status === "Deal done").length;
    setKpis([
      {
        title: "Total Leads",
        value: list.length,
        icon: <Users size={24} />,
        color: "blue",
      },
      {
        title: "Meeting Done",
        value: meetingDone,
        icon: <Check size={24} />,
        color: "orange",
      },
      {
        title: "Deal Done",
        value: dealDone,
        icon: <Award size={24} />,
        color: "green",
      },
    ]);
  };

  // Add new handler function
  const handleFollowUpScheduled = (
    leadId: string,
    date: string,
    time: string
  ) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId
          ? { ...lead, followUpDate: date, followUpTime: time }
          : lead
      )
    );
  };

  // Created ".csv" file for Imported CSV //
  const handleDownloadSample = () => {
    const headers = [
      "created_time",
      "platform",
      "name",
      "whatsapp_number_",
      "lead_status",
      "comments",
    ];
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusUpdate = (leadId: string, newStatus: string) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId ? { ...lead, lead_status: newStatus } : lead
      )
    );
  };

  // Add handler for customer comment updates
  const handleUpdateCustomerComment = (leadId: string, comment: string) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId ? { ...lead, customerComment: comment } : lead
      )
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      leads,
      `leads_export_${new Date().toISOString().split("T")[0]}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 rounded border-yellow-400 bg-yellow-50 px-4 py-3 flex items-start">
        <svg
          className="h-5 w-5 flex-shrink-0 text-yellow-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.366-.756 1.4-.756 1.766 0l6.518 13.452A.75.75 0 0115.75 18h-11.5a.75.75 0 01-.791-1.449l6.518-13.452zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-4a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 0110 10z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ml-3 text-yellow-800">
          <p className="font-medium">Warning</p>
          <p className="mt-1 text-sm">⚠️ {warning}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
        <div>
          <button
            onClick={() => setShowPopup(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mx-2"
          >
            Import to CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Export to CSV
          </button>
        </div>
      </div>

    {showPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-gray-200">
      {/* Close Button */}
      <button
        onClick={() => setShowPopup(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-3xl transition-colors"
      >
        &times;
      </button>

      {/* Title */}
      <h3 className="text-xl font-bold mb-6 text-gray-800 text-center">
        📂 Import CSV File
      </h3>

      {/* Error message */}
      {importError && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-2 text-red-700 shadow text-sm">
          {importError}
        </div>
      )}

      {/* Step List */}
      <ol className="list-decimal space-y-6 text-gray-700 text-sm pl-6">
        {/* Step 1 */}
        <li>
          <p className="mb-2 font-medium">Download the sample file:</p>
          <button
            onClick={handleDownloadSample}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 shadow transition"
          >
            Download
          </button>
        </li>

        {/* Step 2 */}
        <li>
          <p className="font-medium">
            Add your data to the file using the same format as shown in the
            sample.
          </p>
        </li>

        {/* Step 3 */}
        <li>
          <p className="mb-2 font-medium">Import your updated file:</p>
          <label className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 shadow transition">
            Import
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVImport}
            />
          </label>
        </li>
      </ol>
    </div>
  </div>
)}



      <LeadsTable
        leads={leads}
        onStatusUpdate={handleStatusUpdate}
        onFollowUpScheduled={handleFollowUpScheduled}
        onUpdateCustomerComment={handleUpdateCustomerComment}
      />
    </div>
  );
};
export default Dashboard;
