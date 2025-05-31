// import React, { useEffect, useState } from "react";
// import LeadsTable from "../components/dashboard/LeadsTable";
// import { Lead } from "../types";
// import { syncLeadsFromSheets, fetchLeadsFromFirestore } from "../services/api";
// import { exportToCSV } from "../utils/exportCsv";

// const LeadsManagement: React.FC = () => {
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadLeads = async () => {
//       try {
//         setLoading(true);
//         await syncLeadsFromSheets();
//         const firestoreLeads = await fetchLeadsFromFirestore();
//         setLeads(firestoreLeads);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load leads: " + (err as Error).message);
//         setLoading(false);
//       }
//     };
//     loadLeads();
//   }, []);

//   const handleStatusUpdate = (leadId: string, newStatus: string) => {
//     setLeads(
//       leads.map((lead) =>
//         lead.id === leadId ? { ...lead, lead_status: newStatus } : lead
//       )
//     );
//   };

//   const handleExportCSV = () => {
//     exportToCSV(
//       leads,
//       `leads_export_${new Date().toISOString().split("T")[0]}`
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
//         <div className="flex">
//           <div className="flex-shrink-0">
//             <svg
//               className="h-5 w-5 text-red-500"
//               xmlns="http://www.w3.org/2000/svg"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//               aria-hidden="true"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//           <div className="ml-3">
//             <h3 className="text-sm font-medium text-red-800">Error</h3>
//             <div className="mt-2 text-sm text-red-700">
//               <p>{error}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="mb-6 flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
//           <p className="text-gray-600">
//             View, filter, and manage all your leads
//           </p>
//         </div>

//         <button
//           onClick={handleExportCSV}
//           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           Export to CSV
//         </button>
//       </div>

//       <LeadsTable leads={leads} onStatusUpdate={handleStatusUpdate} />
//     </div>
//   );
// };

// export default LeadsManagement;

import React, { useEffect, useState } from "react";
import LeadsTable from "../components/dashboard/LeadsTable";
import { Lead } from "../types";
import { syncLeadsFromSheets, fetchLeadsFromFirestore } from "../services/api";
import { exportToCSV } from "../utils/exportCsv";

const LeadsManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        await syncLeadsFromSheets();
        const firestoreLeads = await fetchLeadsFromFirestore();
        setLeads(firestoreLeads);
        setLoading(false);
      } catch (err) {
        setError("Failed to load leads: " + (err as Error).message);
        setLoading(false);
      }
    };
    loadLeads();
  }, []);

  const handleStatusUpdate = (leadId: string, newStatus: string) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId ? { ...lead, lead_status: newStatus } : lead
      )
    );
  };

  // New handler for follow-up scheduling
  const handleFollowUpScheduled = (leadId: string, date: string, time: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, followUpDate: date, followUpTime: time } 
        : lead
    ));
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
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600">
            View, filter, and manage all your leads
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Export to CSV
        </button>
      </div>

      {/* Updated with new onFollowUpScheduled prop */}
      <LeadsTable 
        leads={leads} 
        onStatusUpdate={handleStatusUpdate}
        onFollowUpScheduled={handleFollowUpScheduled}
      />
    </div>
  );
};

export default LeadsManagement;