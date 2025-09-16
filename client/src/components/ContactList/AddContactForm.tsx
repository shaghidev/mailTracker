// src/components/ContactList/AddContactForm.tsx
'use client';
import { useState } from 'react';
import { Contact } from '@/types/Contact';

interface Props {
  onAdd: (contact: Contact) => void;
}

const AddContactForm: React.FC<Props> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onAdd({ id: crypto.randomUUID(), name, email });
    setName('');
    setEmail('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 mb-4 w-full"
    >
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="px-3 py-2 rounded bg-[#1F2937] text-white 
                   placeholder-[#A0AEC0] w-full sm:w-auto flex-1"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="px-3 py-2 rounded bg-[#1F2937] text-white 
                   placeholder-[#A0AEC0] w-full sm:w-auto flex-1"
      />
      <button
        type="submit"
        className="bg-[#22C55E] px-4 py-2 rounded hover:bg-[#16A34A] 
                   transition-colors font-medium w-full sm:w-auto"
      >
        Add
      </button>
    </form>
  );
};

export default AddContactForm;
