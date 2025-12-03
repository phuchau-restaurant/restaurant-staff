import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NavigationButtons = ({ currentStep, totalSteps, onPrevious, onNext, onFinish }) => {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
      <button
        onClick={onPrevious}
        disabled={currentStep === 1}
        className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
          currentStep === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
        Quay lại
      </button>

      {currentStep === totalSteps ? (
        <button
          onClick={onFinish}
          className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 flex items-center gap-2"
        >
          Hoàn tất
        </button>
      ) : (
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 flex items-center gap-2"
        >
          Tiếp theo
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;
