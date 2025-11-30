import React, { useState } from 'react';
import { Store, Grid3x3, Menu, Users, Monitor, CheckCircle } from 'lucide-react';
import ProgressBar from '../components/Onboarding/ProgressBar';
import NavigationButtons from '../components/Onboarding/NavigationButtons';
import InfoPanel from '../components/Onboarding/InfoPanel';
import RestaurantInfoStep from './Onboarding/RestaurantInfoStep';
import TableAreasStep from './Onboarding/TableAreasStep';
import MenuSetupStep from './Onboarding/MenuSetupStep';
import StaffAccountsStep from './Onboarding/StaffAccountsStep';
import KitchenDisplayStep from './Onboarding/KitchenDisplayStep';
import POSConfigStep from './Onboarding/POSConfigStep';
import SummaryStep from './Onboarding/SummaryStep';

const OnboardingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Step 1 - Restaurant Info
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '',
    type: '',
    address: '',
    logo: null,
    model: ''
  });

  // Step 2 - Table Areas
  const [tableAreas, setTableAreas] = useState([
    { id: 1, name: 'Khu vực 1', tables: 10 }
  ]);

  // Step 3 - Menu Setup
  const [menuGroups, setMenuGroups] = useState([
    { id: 1, name: 'Món chính', dishes: [] }
  ]);
  const [currentDish, setCurrentDish] = useState({ name: '', price: '', image: null });

  // Step 4 - Staff Accounts
  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Waiter', username: '', password: '' });

  // Step 5 - Kitchen Display
  const [kdsStations, setKdsStations] = useState([
    { id: 1, name: 'Bếp chính', dishes: [] }
  ]);

  // Step 6 - POS Configuration
  const [posConfig, setPosConfig] = useState({
    posType: 'PC',
    billPrinter: '',
    kitchenPrinter: ''
  });

  const stepTitles = [
    'Restaurant Info',
    'Table Areas',
    'Menu Setup',
    'Staff Accounts',
    'Kitchen Display',
    'POS Configuration',
    'Summary'
  ];

  const stepIcons = [Store, Grid3x3, Menu, Users, Monitor, Monitor, CheckCircle];

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestaurantInfo({ ...restaurantInfo, logo: URL.createObjectURL(file) });
    }
  };

  const addTableArea = () => {
    setTableAreas([...tableAreas, { id: Date.now(), name: `Khu vực ${tableAreas.length + 1}`, tables: 5 }]);
  };

  const removeTableArea = (id) => {
    setTableAreas(tableAreas.filter(area => area.id !== id));
  };

  const updateTableArea = (id, field, value) => {
    setTableAreas(tableAreas.map(area => 
      area.id === id ? { ...area, [field]: value } : area
    ));
  };

  const addMenuGroup = () => {
    setMenuGroups([...menuGroups, { id: Date.now(), name: `Nhóm ${menuGroups.length + 1}`, dishes: [] }]);
  };

  const updateGroupName = (id, name) => {
    setMenuGroups(menuGroups.map(group => 
      group.id === id ? { ...group, name } : group
    ));
  };

  const addDishToGroup = (groupId) => {
    if (currentDish.name && currentDish.price) {
      setMenuGroups(menuGroups.map(group => 
        group.id === groupId 
          ? { ...group, dishes: [...group.dishes, { ...currentDish, id: Date.now() }] }
          : group
      ));
      setCurrentDish({ name: '', price: '', image: null });
    }
  };

  const addStaff = () => {
    if (newStaff.name && newStaff.username && newStaff.password) {
      setStaff([...staff, { ...newStaff, id: Date.now() }]);
      setNewStaff({ name: '', role: 'Waiter', username: '', password: '' });
    }
  };

  const removeStaff = (id) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const addStation = () => {
    setKdsStations([...kdsStations, { id: Date.now(), name: `Station ${kdsStations.length + 1}`, dishes: [] }]);
  };

  const updateStationName = (id, name) => {
    setKdsStations(kdsStations.map(station => 
      station.id === id ? { ...station, name } : station
    ));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <RestaurantInfoStep 
            restaurantInfo={restaurantInfo} 
            setRestaurantInfo={setRestaurantInfo}
            handleLogoUpload={handleLogoUpload}
          />
        );
      case 2:
        return (
          <TableAreasStep 
            tableAreas={tableAreas} 
            setTableAreas={setTableAreas}
            addTableArea={addTableArea}
            removeTableArea={removeTableArea}
            updateTableArea={updateTableArea}
          />
        );
      case 3:
        return (
          <MenuSetupStep 
            menuGroups={menuGroups} 
            setMenuGroups={setMenuGroups}
            currentDish={currentDish}
            setCurrentDish={setCurrentDish}
            addMenuGroup={addMenuGroup}
            updateGroupName={updateGroupName}
            addDishToGroup={addDishToGroup}
          />
        );
      case 4:
        return (
          <StaffAccountsStep 
            staff={staff} 
            setStaff={setStaff}
            newStaff={newStaff}
            setNewStaff={setNewStaff}
            addStaff={addStaff}
            removeStaff={removeStaff}
          />
        );
      case 5:
        return (
          <KitchenDisplayStep 
            kdsStations={kdsStations} 
            setKdsStations={setKdsStations}
            addStation={addStation}
            updateStationName={updateStationName}
          />
        );
      case 6:
        return (
          <POSConfigStep 
            posConfig={posConfig} 
            setPosConfig={setPosConfig} 
          />
        );
      case 7:
        return (
          <SummaryStep 
            restaurantInfo={restaurantInfo}
            tableAreas={tableAreas}
            menuGroups={menuGroups}
            staff={staff}
            kdsStations={kdsStations}
            posConfig={posConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header với tiêu đề và progress bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
              {React.createElement(stepIcons[currentStep - 1], { className: "w-8 h-8 text-white" })}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Thiết lập hệ thống</h1>
              <p className="text-gray-600">Bước {currentStep} trong {totalSteps}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar currentStep={currentStep} stepTitles={stepTitles} />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Side - Info Panel */}
          <div className="col-span-4">
            <InfoPanel currentStep={currentStep} />
          </div>

          {/* Right Side - Form */}
          <div className="col-span-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
              {renderStepContent()}

              <NavigationButtons
                currentStep={currentStep}
                totalSteps={totalSteps}
                onPrevious={prevStep}
                onNext={nextStep}
                onFinish={onComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
