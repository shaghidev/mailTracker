'use client';
import { Contact } from '@/types/Contact';

interface Props {
  contacts: Contact[];
  onDelete: (id: string) => void;
}

const ContactTable: React.FC<Props> = ({ contacts, onDelete }) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-[#1F2937] text-[#FFBD00]">
          <th className="p-2">Name</th>
          <th className="p-2">Email</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map(c => (
          <tr key={c.id} className="bg-[#0A0F12] text-[#FFFFFF] hover:bg-[#1F2937]">
            <td className="p-2">{c.name}</td>
            <td className="p-2">{c.email}</td>
            <td className="p-2">
              <button onClick={() => onDelete(c.id)} className="bg-[#EF4444] py-1 px-3 rounded hover:bg-[#DC2626]">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ContactTable;
