import { Lead } from '../types';
import { format, parseISO, subDays } from 'date-fns';

export const getLeadCountByStatus = (leads: Lead[]): Record<string, number> => {
  return leads.reduce((acc, lead) => {
    const status = lead.lead_status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const getLeadCountByPlatform = (leads: Lead[]): Record<string, number> => {
  return leads.reduce((acc, lead) => {
    const platform = lead.platform || 'Unknown';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const getLeadsByDateRange = (leads: Lead[], days: number): Record<string, number> => {
  const today = new Date();
  const result: Record<string, number> = {};
  
  // Initialize all dates in range with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(today, i), 'MMM dd');
    result[date] = 0;
  }
  
  // Count leads by date
  leads.forEach(lead => {
    try {
      const leadDate = parseISO(lead.created_time);
      const formattedDate = format(leadDate, 'MMM dd');
      
      // Only count if it's within our range
      if (result[formattedDate] !== undefined) {
        result[formattedDate] += 1;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  });
  
  return result;
};

export const getLocationData = (leads: Lead[]): Record<string, number> => {
  return leads.reduce((acc, lead) => {
    // Extract location from comments field
    const locationMatch = lead.comments.match(/📍 Location: ([^\n]+)/);
    const location = locationMatch ? locationMatch[1] : 'Unknown';
    
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const extractLeadScore = (comments: string): number => {
  const scoreMatch = comments.match(/🏆 Lead Score: (\d+)/);
  return scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
};

export const getAverageLeadScore = (leads: Lead[]): number => {
  const scores = leads
    .map(lead => extractLeadScore(lead.comments))
    .filter(score => score > 0);
  
  if (scores.length === 0) return 0;
  
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
};