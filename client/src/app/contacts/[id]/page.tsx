'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useContactList } from '@/hooks/useContacts';
import { useAuth0 } from '@auth0/auth0-react';
import ContactTable from '@/components/ContactList/ContactListTable';
import AddContactForm from '@/components/ContactList/AddContactForm';
import ImportContactsModal from '@/components/ContactList/ImportContactsModal';
import { motion } from 'framer-motion';

const ContactListPage = () => {
  const { id } = useParams();
  const listId = Array.isArray(id) ? id[0] : id ?? '';
  const router = useRouter();
  const { isAuthenticated } = useAuth0();

  const { contacts, loading, fetchContacts, addContact, deleteContact } =
    useContactList(listId);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D10] text-[#FFFFFF] px-4">
        <p className="text-base sm:text-lg text-[#A0AEC0] text-center">
          Login to see contacts
        </p>
      </div>
    );
  }

  if (!id) return <p>Invalid list ID</p>;

  return (
    <div className="min-h-screen bg-[#080D10] text-white px-4 sm:px-6 md:px-8 py-6">
      <div className="container mx-auto flex flex-col gap-6">
        {/* Back Button */}
        <motion.button
          onClick={() => router.push('/contacts')}
          className="bg-[#2979FF] px-4 py-2 rounded hover:bg-[#1E63D8] 
                     w-full sm:w-max text-sm sm:text-base font-medium"
          whileHover={{ scale: 1.05 }}
        >
          Back to Lists
        </motion.button>

        {/* Header */}
        <motion.h1
          className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#FFBD00] mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Contact List
        </motion.h1>

        {/* Add Contact Form */}
        <div className="w-full">
          <AddContactForm onAdd={addContact} />
        </div>

        {/* Import Button */}
        <button
          onClick={() => setShowImport(true)}
          className="bg-[#FFBD00] text-black px-4 py-2 rounded hover:bg-[#E6AC00] 
                     w-full sm:w-max text-sm sm:text-base font-medium"
        >
          Import CSV/Excel
        </button>

        {/* Contacts Table */}
        <div className="overflow-x-auto w-full rounded-lg border border-[#1E293B]">
          {loading ? (
            <p className="text-[#A0AEC0] text-center py-4">
              Loading contacts...
            </p>
          ) : (
            <ContactTable contacts={contacts} onDelete={deleteContact} />
          )}
        </div>

        {/* Import Modal */}
        {showImport && (
          <ImportContactsModal
            list={{
              id: listId,
              name: 'Your list name',
              emails: contacts.map((c) => c.email),
            }}
            onClose={() => setShowImport(false)}
            onImported={() => fetchContacts()}
          />
        )}
      </div>
    </div>
  );
};

export default ContactListPage;
