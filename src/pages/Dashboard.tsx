import React, { useEffect, useState } from "react";
import { Users, Check, Award } from "lucide-react";
import KPICard from "../components/dashboard/KPICard";
import LeadsTable from "../components/dashboard/LeadsTable";
import { Lead, KPI } from "../types";
import { syncLeadsFromSheets, fetchLeadsFromFirestore } from "../services/api";
import { exportToCSV } from "../utils/exportCsv";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);

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

  // Add useEffect to recalculate KPIs when leads change
  useEffect(() => {
    computeKPIs(leads);
  }, [leads]); // This will trigger whenever leads array changes

  const computeKPIs = (list: Lead[]) => {
    const meetingDone = list.filter(
      (l) => l.lead_status === "Meeting Done"
    ).length;
    const dealDone = list.filter((l) => l.lead_status === "Deal Done").length;
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
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Export to CSV
        </button>
      </div>

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