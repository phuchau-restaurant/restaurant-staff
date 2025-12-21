import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardContent from '../../screens/Dashboard/DashboardContent';
import OrdersContent from '../../screens/Dashboard/OrdersContent';
import InventoryContent from '../../screens/Dashboard/InventoryContent';
import SalesContent from '../../screens/Dashboard/SalesContent';
import FeedbackContent from '../../screens/Dashboard/FeedbackContent';
import TablesScreen from '../../screens/TablesScreen';

const DashboardLayout = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardContent />;
      case 'orders':
        return <OrdersContent />;
      case 'tables':
        return <TablesScreen />;
      case 'inventory':
        return <InventoryContent />;
      case 'sales':
        return <SalesContent />;
      case 'feedback':
        return <FeedbackContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Always visible */}
      <Sidebar activeMenu={activeMenu} onNavigate={setActiveMenu} />

      {/* Main Content - Changes based on active menu */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardLayout;
