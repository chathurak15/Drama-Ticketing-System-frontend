import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color = "text-gray-600", borderColor = "border-[#661F19]" }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {trend && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{trend}% from last month
          </p>
        )}
      </div>
      <Icon className="w-8 h-8 text-[#661F19]" />
    </div>
  </div>
);

export default StatCard;