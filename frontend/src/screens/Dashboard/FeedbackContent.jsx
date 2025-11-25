import React from 'react';

const FeedbackContent = () => {
  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-8 py-6">
          <h2 className="text-3xl font-bold text-gray-800">Customer Feedback</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage customer feedback</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 bg-gray-100 min-h-screen">
        <p className="text-gray-500">Customer feedback content will be here...</p>
      </div>
    </>
  );
};

export default FeedbackContent;
