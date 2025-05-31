import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, change, color }) => {
  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };
  
  const getChangeIcon = () => {
    if (!change) return null;
    return change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };
  
  const getBgColor = () => {
    switch (color) {
      case 'blue': return 'bg-blue-50';
      case 'green': return 'bg-green-50';
      case 'orange': return 'bg-orange-50';
      default: return 'bg-gray-50';
    }
  };
  
  const getIconBgColor = () => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'orange': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className={`rounded-lg shadow-sm ${getBgColor()} p-6 transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getIconBgColor()} text-white`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-500">{title}</h3>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {change !== undefined && (
              <div className={`flex items-center ml-2 ${getChangeColor()}`}>
                {getChangeIcon()}
                <span className="ml-1 text-sm font-medium">{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICard;