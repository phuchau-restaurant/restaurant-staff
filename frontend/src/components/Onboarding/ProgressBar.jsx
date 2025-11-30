import React from 'react';
import { Store, Grid3x3, Menu, Users, Monitor, CheckCircle, ChevronRight } from 'lucide-react';

const stepIcons = [Store, Grid3x3, Menu, Users, Monitor, CheckCircle, CheckCircle];

const ProgressBar = ({ currentStep, stepTitles }) => {
  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        {stepTitles.map((title, index) => {
          const Icon = stepIcons[index];
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-xs text-center ${
                    isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
                  }`}
                >
                  {title}
                </span>
              </div>
              {index < stepTitles.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-200 relative" style={{ top: '-20px' }}>
                  <div
                    className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="text-center text-gray-600 font-semibold">
        Bước {currentStep} / {stepTitles.length}
      </div>
    </div>
  );
};

export default ProgressBar;
