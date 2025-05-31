import { Lead } from '../types';

export const exportToCSV = (leads: Lead[], fileName: string): void => {
  // Define CSV headers
  const headers = [
    'Created Time',
    'Platform',
    'Name',
    'WhatsApp Number',
    'Lead Status',
    'Comments'
  ];
  
  // Convert leads to CSV rows
  const rows = leads.map(lead => [
    lead.created_time,
    lead.platform,
    lead.name,
    lead.whatsapp_number_,
    lead.lead_status,
    // Clean up comments for CSV (remove newlines, quotes)
    lead.comments.replace(/\n/g, ' ').replace(/"/g, '""')
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};