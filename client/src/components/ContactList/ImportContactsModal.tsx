'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ContactList, Contact } from '@/types/Contact';
import * as contactService from '@/services/contactService';
import { useAuth0 } from '@auth0/auth0-react';

interface Props {
  list: ContactList;
  onClose: () => void;
  onImported: () => void;
}

const ImportContactsModal: React.FC<Props> = ({ list, onClose, onImported }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [contactsPreview, setContactsPreview] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // novi state za file

  // Odabir datoteke
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file); // spremi file u state
    parseFile(file);       // parsiraj za preview
  };

  // Parsiranje CSV/Excel i filtriranje duplikata
  const parseFile = async (file: File) => {
    let contacts: Contact[] = [];

    if (file.type.includes('csv')) {
      const text = await file.text();
      const parsed = Papa.parse(text, { header: true });
      contacts = parsed.data as Contact[];
    } else {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      contacts = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Contact[];
    }

    // filtriraj duplikate prema postojećim emailovima
    const existingEmails = new Set(list.emails.map(e => e.toLowerCase()));
    const unique = contacts.filter(c => c.email && !existingEmails.has(c.email.toLowerCase()));

    setContactsPreview(unique.slice(0, 20)); // preview prvih 20
    setFilteredContacts(unique);
  };

  // Slanje kontakata na backend
  const handleImport = async () => {
    if (!selectedFile || filteredContacts.length === 0) {
      return alert('No new contacts to import.');
    }

    try {
      const token = await getAccessTokenSilently();
      await contactService.importContactsFile(list.id, selectedFile, token); // koristi selectedFile
      alert(`${filteredContacts.length} contacts imported successfully`);
      onImported();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error importing contacts.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1F2937] p-6 rounded-2xl w-[90%] max-w-lg max-h-[90vh] overflow-auto">
        <h2 className="text-2xl font-bold text-[#FFBD00] mb-4">
          Import Contacts to {list.name}
        </h2>

        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm"
        />

        {contactsPreview.length > 0 && (
          <div className="mb-4 border border-gray-600 rounded p-2 max-h-60 overflow-auto">
            <p className="text-gray-300 mb-2 font-semibold">
              Preview ({contactsPreview.length} contacts shown)
            </p>
            <table className="w-full text-sm text-left text-white">
              <thead>
                <tr className="border-b border-gray-500">
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Email</th>
                </tr>
              </thead>
              <tbody>
                {contactsPreview.map((c, idx) => (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="px-2 py-1">{c.name}</td>
                    <td className="px-2 py-1">{c.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="bg-[#EF4444] py-2 px-4 rounded-lg hover:bg-[#DC2626] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="bg-[#22C55E] py-2 px-4 rounded-lg hover:bg-[#16A34A] transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportContactsModal;
