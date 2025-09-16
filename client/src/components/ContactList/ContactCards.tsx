'use client';
import React from 'react';
import { Contact } from '@/types/Contact';

interface Props {
  contacts: Contact[];
}

const ContactCards: React.FC<Props> = ({ contacts }) => {
  if (!contacts.length)
    return (
      <p className="text-gray-400 text-center py-6">
        No contacts to display.
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {contacts.map((c, idx) => (
        <div
          key={idx}
          className="bg-[#111827] p-4 rounded-xl shadow hover:shadow-lg 
                     transition flex flex-col gap-1"
        >
          <h3 className="text-lg font-bold text-[#FFBD00] break-words">
            {c.name || '-'}
          </h3>
          <p className="text-gray-300 break-all">{c.email}</p>
          {c.company && (
            <p className="text-gray-400 text-sm">Company: {c.company}</p>
          )}
          {c.product && (
            <p className="text-gray-400 text-sm">Product: {c.product}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactCards;
