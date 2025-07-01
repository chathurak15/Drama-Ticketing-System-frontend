import React from 'react';
import { CreditCard, Star, TrendingUp } from 'lucide-react';
import TableRow from './TableRow';

const AnalyticsContent = () => {
  const dramas = [
    // Sample data - replace with API call
    {
      id: 1,
      title: "Romeo and Juliet",
      genre: "Tragedy",
      duration: "2h 30m",
      cast: ["John Doe", "Jane Smith", "Mike Johnson"],
      director: "Sarah Wilson",
      description: "A timeless tale of love and tragedy"
    },
    {
      id: 2,
      title: "Hamlet",
      genre: "Tragedy",
      duration: "3h 15m",
      cast: ["Robert Brown", "Emily Davis", "Tom Wilson"],
      director: "David Miller",
      description: "The prince of Denmark's quest for revenge"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics & Reports</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[12, 19, 15, 27, 22, 35, 28].map((height, idx) => (
              <div key={idx} className="bg-gradient-to-t from-[#661F19] to-[#b33529] rounded-t" style={{height: `${height * 2}px`, width: '40px'}}></div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Dramas</h3>
          <div className="space-y-4">
            {dramas.map((drama, idx) => (
              <div key={drama.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#661F19] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <span className="font-medium">{drama.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">4.{8 - idx}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <TableRow>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#TXN001</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Alice Johnson</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Romeo and Juliet</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$25.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2025-06-18</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                </td>
              </TableRow>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsContent;