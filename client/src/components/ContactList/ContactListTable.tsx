'use client';
import { Contact } from '@/types/Contact';

interface Props {
  contacts: Contact[];
  onDelete: (email: string) => void;
}

const ContactTable: React.FC<Props> = ({ contacts, onDelete }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-full">
        <thead>
          <tr className="bg-[#1F2937] text-[#FFBD00] text-sm sm:text-base">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Company</th>
            <th className="p-2">Product</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(c => (
            <tr
              key={c.email}
              className="bg-[#0A0F12] text-white hover:bg-[#1F2937] text-sm sm:text-base"
            >
              <td className="p-2">{c.name}</td>
              <td className="p-2 break-all">{c.email}</td>
              <td className="p-2">{c.company || '-'}</td>
              <td className="p-2">{c.product || '-'}</td>
              <td className="p-2">
                <button
                  onClick={() => onDelete(c.email)}
                  className="bg-[#EF4444] py-1 px-3 rounded hover:bg-[#DC2626] text-xs sm:text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactTable;
