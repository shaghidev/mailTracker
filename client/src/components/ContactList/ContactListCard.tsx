import React from 'react';
import { ContactList } from '@/types/Contact';

interface Props {
  list: ContactList;
  onView: (list: ContactList) => void;
  onDelete: (id: string) => void;
}

const ContactListCard: React.FC<Props> = ({ list, onView, onDelete }) => (
  <li className="bg-[#1F2937] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer list-none">
    <h2 className="font-bold text-xl mb-2 text-[#FFBD00]">{list.name}</h2>
<p className="text-[#A0AEC0]">{list.emails?.length ?? 0} emails</p>
    <div className="mt-4 flex gap-2">
      <button
        className="flex-1 bg-[#2979FF] py-2 rounded-lg hover:bg-[#1E63D8] transition-colors"
        onClick={() => onView(list)}
      >
        View
      </button>
      <button
        className="flex-1 bg-[#EF4444] py-2 rounded-lg hover:bg-[#DC2626] transition-colors"
        onClick={() => onDelete(list.id)}
      >
        Delete
      </button>
    </div>
  </li>
);

export default ContactListCard;
