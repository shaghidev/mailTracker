'use client';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useContactLists } from '@/hooks/useContactLists';
import { addContactList, deleteContactList } from '@/services/contactService';
import ContactListCard from '@/components/ContactList/ContactListCard';
import { ContactList } from '@/types/Contact';
import { useRouter } from 'next/navigation';

const ContactsPage = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { lists, loading, fetchLists } = useContactLists();
  const [newListName, setNewListName] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) fetchLists();
  }, [isAuthenticated, fetchLists]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D10] text-white px-4">
        <p className="text-base sm:text-lg text-[#A0AEC0] text-center">
          Login to see contact lists
        </p>
      </div>
    );
  }

  const handleAddList = async () => {
    if (!newListName.trim()) return;
    try {
      const token = await getAccessTokenSilently();
      await addContactList(newListName, token);
      setNewListName('');
      fetchLists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      await deleteContactList(id, token);
      fetchLists();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D10] text-white px-4 sm:px-6 md:px-8 py-6">
      <div className="container mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-[#FFBD00]">
            Contact Lists
          </h1>

          {/* Input + Button */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="New list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="px-3 py-2 rounded-lg text-white bg-[#1F2937] placeholder-[#A0AEC0] w-full sm:w-64"
            />
            <button
              onClick={handleAddList}
              className="bg-[#22C55E] py-2 px-4 rounded-lg hover:bg-[#16A34A] transition-colors w-full sm:w-auto"
            >
              Add
            </button>
          </div>
        </div>

        {/* Lists */}
        {loading ? (
          <p className="text-[#A0AEC0]">Loading lists...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lists.map((list: ContactList) => (
              <ContactListCard
                key={list.id}
                list={list}
                onView={() => router.push(`/contacts/${list.id}`)}
                onDelete={handleDeleteList}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
