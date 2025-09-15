'use client';
import React from 'react';
import { Contact } from '@/types/Contact';

interface Props {
  contacts: Contact[];
}

const ContactCards: React.FC<Props> = ({ contacts }) => {
  if (!contacts.length) return <p className="text-gray-400">No contacts to display.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {contacts.map((c, idx) => (
        <div key={idx} className="bg-[#111827] p-4 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-[#FFBD00]">{c.name || '-'}</h3>
          <p className="text-gray-300">{c.email}</p>
          {c.company && <p className="text-gray-400">Company: {c.company}</p>}
          {c.product && <p className="text-gray-400">Product: {c.product}</p>}
        </div>
      ))}
    </div>
  );
};

export default ContactCards;
