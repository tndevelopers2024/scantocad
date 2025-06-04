import { useState } from 'react';
import StepPaymentModal from './PaymentModalQuote';
import useCreditHours from '../../contexts/useCreditHours';
import { 
FiPlus
} from 'react-icons/fi';
const CreditHours = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { hours: rawHours, name, loading, error } = useCreditHours();

  // split into integer hours and remaining minutes
  const hrs = Math.floor(rawHours);
  const mins = Math.round((rawHours - hrs) * 60);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4 inline-block">
        <div className="text-sm text-gray-500 mb-2">Available Credit Hours</div>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-4 inline-block">
        <div className="text-sm text-gray-500 mb-2">Available Credit Hours</div>
        <div className="text-red-500 text-sm">Error loading data</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 inline-block">
        <div className="text-sm text-gray-500 mb-3">Available Credit Hours</div>
        
        <div className="flex items-center space-x-3">
          {/* Hours block */}
          <div className="bg-gray-800 text-white rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-mono font-bold">
              {String(hrs).padStart(2, '0')}
            </div>
            <div className="text-xs uppercase text-gray-300 mt-0.5">Hours</div>
          </div>

          {/* Minutes block */}
          <div className="bg-gray-800 text-white rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-mono font-bold">
              {String(mins).padStart(2, '0')}
            </div>
            <div className="text-xs uppercase text-gray-300 mt-0.5">Mins</div>
          </div>

          {/* Plus button */}
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="ml-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-blue-700 transition"
          >
               <FiPlus />
          </button>
        </div>

      </div>

      <StepPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={() => {       
        }}
      />
    </>
  );
};

export default CreditHours;
