'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ContactList, Contact } from '@/types/Contact';
import { useAuth0 } from '@auth0/auth0-react';
import axios from "axios";
import ContactCards from './ContactCards';
import ContactTable from './ContactListTable';

interface Props {
  list: ContactList;
  onClose: () => void;
  onImported: () => void;
}

const API_URL = "https://mailtracker-7jvy.onrender.com";

const columnMap: Record<string, string[]> = {
  name: ["Name", "Full Name", "Ime", "Naziv"],
  email: ["Email", "Email Address", "E-mail", "Mail", "email"],
  company: ["Company", "Firma", "Organization"],
  product: ["Product", "Proizvod"],
  address: ["Address", "Adresa", "Street"],
  website: ["Website", "Web", "Web Address", "URL"],
  phone: ["Phone", "Telefon", "Mobile"],
  title: ["Title", "Pozicija", "Role"],
  city: ["City", "Grad"],
  country: ["Country", "Država"]
};

const mapRowToContact = (row: Record<string, unknown>): Contact => {
  const c: Partial<Contact> = {};
  const rowNormalized: Record<string, string> = {};

  for (const key in row) {
    const val = row[key];
    if (val !== undefined && val !== null) {
      rowNormalized[key.trim().toLowerCase()] = String(val).trim();
    }
  }

  for (const key in columnMap) {
    const possibleNames = columnMap[key];
    for (const col of possibleNames) {
      const value = rowNormalized[col.toLowerCase()];
      if (value) {
        c[key as keyof Contact] = value;
        break;
      }
    }
  }

  if (!c.name && c.email) c.name = (c.email as string).split("@")[0];
  return c as Contact;
};

const ImportContactsModal: React.FC<Props> = ({ list, onClose, onImported }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [contactsPreview, setContactsPreview] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseFile(file);
  };

  const parseFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Record<string, unknown>[];

    // mapiranje i filtriranje po emailu
    const contacts = rawRows.map(mapRowToContact).filter(c => !!c.email);
    const existingEmails = new Set((list.emails ?? []).map(e => e.toLowerCase()));

    const uniqueContacts: Contact[] = [];
    const seen = new Set<string>();

    contacts.forEach(c => {
      const emailLower = c.email.toLowerCase();
      if (!existingEmails.has(emailLower) && !seen.has(emailLower)) {
        uniqueContacts.push(c);
        seen.add(emailLower);
      }
    });

    if (uniqueContacts.length === 0) alert("No new contacts found in the file!");

    setContactsPreview(uniqueContacts.slice(0, 20));
    setFilteredContacts(uniqueContacts);
  };

  const handleImport = async () => {
    if (filteredContacts.length === 0) {
      alert("No new contacts to import!");
      return;
    }

    try {
      const token = await getAccessTokenSilently();

      const res = await axios.post(
        `${API_URL}/api/contact_lists/${list.id}/contacts/import`,
        { contacts: filteredContacts }, // šaljemo samo filtrirane kontakte
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const importedCount = res.data.imported || filteredContacts.length;
      alert(`Import successful! ${importedCount} contacts added.`);

      onImported();
      onClose();
    } catch (err) {
      console.error("Import error:", err);
      alert("Import failed!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1F2937] p-6 rounded-2xl w-[90%] max-w-3xl max-h-[90vh] overflow-auto">
        <h2 className="text-2xl font-bold text-[#FFBD00] mb-4">
          Import Contacts to {list.name}
        </h2>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm"
        />

        {contactsPreview.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-300 mb-2 font-semibold">
              Preview ({contactsPreview.length} contacts)
            </p>
            <ContactCards contacts={contactsPreview} />
            <div className="mt-4">
              <ContactTable
                contacts={contactsPreview}
                onDelete={(email) => {
                  setContactsPreview(prev => prev.filter(c => c.email !== email));
                  setFilteredContacts(prev => prev.filter(c => c.email !== email));
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
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
