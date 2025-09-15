'use client';
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ContactList, Contact } from '@/types/Contact';
import axios from "axios";
interface Props {
  list: ContactList;
  onClose: () => void;
  onImported: () => void;
}

const API_URL = "https://mailtracker-7jvy.onrender.com"; // ili iz env varijable

// Mapiranje 10 najčešćih polja
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

  // normaliziraj ključeve: trim + lowercase
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
      // traži normalizirani ključ
      const value = rowNormalized[col.toLowerCase()];
      if (value) {
        c[key as keyof Contact] = value;
        break;
      }
    }
  }

  // fallback: ako nema name, koristi email prije @
  if (!c.name && c.email) {
    c.name = (c.email as string).split("@")[0];
  }

  return c as Contact;
};




const ImportContactsModal: React.FC<Props> = ({ list, onClose, onImported }) => {
  const [contactsPreview, setContactsPreview] = useState<Contact[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    setSelectedFile(file);
    parseFile(file);
    
  };

const parseFile = async (file: File) => {
  let rawRows: Record<string, unknown>[] = [];

  if (file.type.includes("csv")) {
    const text = await file.text();
    const parsed = Papa.parse<Record<string, unknown>>(text, { header: true });
    rawRows = parsed.data;
  } else {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Record<string, unknown>[];
  }

  console.log("Raw rows:", rawRows);

  const contacts = rawRows
    .map(mapRowToContact)
    .filter(c => !!c.name || !!c.email); // minimalno ime i email

  console.log("Mapped contacts:", contacts);

  const existingEmails = new Set((list.emails ?? []).map(e => e.toLowerCase()));
  const unique = contacts.filter(c => !existingEmails.has(c.email.toLowerCase()));

  console.log("Unique contacts:", unique);

  if (unique.length === 0) {
    alert("No new contacts found in the file!");
  }

  setContactsPreview(unique.slice(0, 20));
};


const handleImport = async () => {
  if (!selectedFile) return; // umjesto "file" koristiš state varijablu

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    await axios.post(
      `${API_URL}/api/contact_lists/${list.id}/contacts/import`, // umjesto listId koristiš list._id
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    alert("Import successful!");
    onImported(); // obavijesti parent komponentu da je gotovo
    onClose();
  } catch (err) {
    console.error("Import error:", err);
    alert("Import failed!");
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

        {contactsPreview.length > 0 ? (
          <div className="mb-4 border border-gray-600 rounded p-2 max-h-60 overflow-auto">
            <p className="text-gray-300 mb-2 font-semibold">
              Preview ({contactsPreview.length} contacts shown)
            </p>
            <table className="w-full text-sm text-left text-white">
              <thead>
                <tr className="border-b border-gray-500">
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Email</th>
                  <th className="px-2 py-1">Company</th>
                  <th className="px-2 py-1">Product</th>
                </tr>
              </thead>
              <tbody>
                {contactsPreview.map((c, idx) => (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="px-2 py-1">{c.name}</td>
                    <td className="px-2 py-1">{c.email}</td>
                    <td className="px-2 py-1">{c.company || '-'}</td>
                    <td className="px-2 py-1">{c.product || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 mb-2">No valid contacts found.</p>
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
