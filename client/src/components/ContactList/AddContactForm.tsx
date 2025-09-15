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
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="px-3 py-2 rounded bg-[#1F2937] text-white"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="px-3 py-2 rounded bg-[#1F2937] text-white"
      />
      <button type="submit" className="bg-[#22C55E] px-4 py-2 rounded hover:bg-[#16A34A]">
        Add
      </button>
    </form>
  );
};

export default AddContactForm;
