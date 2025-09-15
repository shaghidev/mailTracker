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
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;

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

    const existingEmails = new Set(list.emails);
    const filtered = contacts.filter(c => c.email && !existingEmails.has(c.email));

    if (filtered.length === 0) return alert('No new contacts to import.');

    try {
      const token = await getAccessTokenSilently();
      await contactService.importContacts(list.id, filtered, token);
      alert(`${filtered.length} contacts imported successfully`);
      onImported();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error importing contacts.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1F2937] p-6 rounded-2xl w-[90%] max-w-lg">
        <h2 className="text-2xl font-bold text-[#FFBD00] mb-4">Import Contacts to {list.name}</h2>
        <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className="mb-4 w-full text-sm" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-[#EF4444] py-2 px-4 rounded-lg hover:bg-[#DC2626] transition-colors">Cancel</button>
          <button onClick={handleImport} className="bg-[#22C55E] py-2 px-4 rounded-lg hover:bg-[#16A34A] transition-colors">Import</button>
        </div>
      </div>
    </div>
  );
};

export default ImportContactsModal;
