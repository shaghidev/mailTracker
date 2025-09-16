import React from 'react';
import { ContactList } from '@/types/Contact';

interface Props {
  list: ContactList;
  onView: () => void;
  onDelete: (id: string) => void;
}

const ContactListCard: React.FC<Props> = ({ list, onView, onDelete }) => (
  <li
    className="bg-[#1F2937] p-6 rounded-2xl shadow-lg hover:shadow-xl 
               transition-shadow cursor-pointer list-none flex flex-col gap-2"
  >
    <h2 className="font-bold text-lg sm:text-xl mb-1 text-[#FFBD00] break-words">
      {list.name}
    </h2>

    <p className="text-[#A0AEC0] text-sm sm:text-base">
      {list.emails?.length ?? 0} kontakata
    </p>
    <p className="text-[#A0AEC0] text-sm">Kliknite za prikaz kontakata</p>

    <div className="mt-4 flex flex-col sm:flex-row gap-2">
      <button
        className="flex-1 bg-[#2979FF] py-2 rounded-lg hover:bg-[#1E63D8] 
                   transition-colors text-sm sm:text-base"
        onClick={onView}
      >
        Prikaži
      </button>
      <button
        className="flex-1 bg-[#EF4444] py-2 rounded-lg hover:bg-[#DC2626] 
                   transition-colors text-sm sm:text-base"
        onClick={() => onDelete(list.id)}
      >
        Obriši
      </button>
    </div>
  </li>
);

export default ContactListCard;
