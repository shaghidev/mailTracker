'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useContactList } from '@/hooks/useContacts';
import { useAuth0 } from '@auth0/auth0-react';
import ContactTable from '@/components/ContactList/ContactListTable';
import AddContactForm from '@/components/ContactList/AddContactForm';
import ImportContactsModal from '@/components/ContactList/ImportContactsModal';

const ContactListPage = () => {
  const { id } = useParams();
  const listId = Array.isArray(id) ? id[0] : id ?? '';
  const router = useRouter();
  const { isAuthenticated } = useAuth0();

  const { contacts, loading, fetchContacts, addContact, deleteContact } = useContactList(listId);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D10] text-[#FFFFFF]">
        <p className="text-lg text-[#A0AEC0]">Login to see contacts</p>
      </div>
    );
  }

  if (!id) return <p>Invalid list ID</p>;

  return (
    <div className="min-h-screen p-8 bg-[#080D10] text-white">
      <button onClick={() => router.push('/contacts')} className="mb-4 bg-[#2979FF] px-4 py-2 rounded hover:bg-[#1E63D8]">
        Back to Lists
      </button>

      <h1 className="text-3xl font-bold text-[#FFBD00] mb-4">Contact List</h1>

      <AddContactForm onAdd={addContact} />

      <button onClick={() => setShowImport(true)} className="mb-4 bg-[#FFBD00] text-black px-4 py-2 rounded hover:bg-[#E6AC00]">
        Import CSV/Excel
      </button>

      {loading ? <p>Loading contacts...</p> : (
        <ContactTable contacts={contacts} onDelete={deleteContact} />
      )}

      {showImport && (
<ImportContactsModal
  list={{ id: listId, name: "Your list name", emails: contacts.map(c => c.email) }} // <-- ovo treba imati id, name i emails
  onClose={() => setShowImport(false)}
  onImported={() => fetchContacts()}
/>

      )}
    </div>
  );
};

export default ContactListPage;
