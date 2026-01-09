// src/components/SlotCard.jsx

import React from 'react';
import { MapPin } from 'lucide-react';

const SlotCard = ({ slot, onClick }) => {
  return (
    <button
      onClick={() => onClick(slot)}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500 group w-full"
    >
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
            <MapPin className="text-green-600" size={32} />
          </div>
        </div>
        <h3 className="font-bold text-xl text-gray-800 mb-1">{slot.name}</h3>
        <p className="text-sm text-gray-600 mb-1">{slot.zone}</p>
        <p className="text-xs text-gray-500 mb-3">Floor {slot.floor}</p>
        <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          AVAILABLE
        </div>
      </div>
    </button>
  );
};

export default SlotCard;