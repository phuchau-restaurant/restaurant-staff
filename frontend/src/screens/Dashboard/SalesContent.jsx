import React from 'react';

const SalesContent = () => {
  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-bold text-gray-800">Sales Reports</h2>
          <p className="text-sm text-gray-500 mt-1">View sales analytics and reports</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 bg-gray-100 min-h-screen">
        <p className="text-gray-500">Sales reports content will be here...</p>
      </div>
    </>
  );
};

export default SalesContent;
