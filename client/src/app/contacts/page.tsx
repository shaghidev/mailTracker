'use client';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useContactLists } from '@/hooks/useContactLists';
import { addContactList, deleteContactList } from '@/services/contactService';
import ContactListCard from '@/components/ContactList/ContactListCard';
import ImportContactsModal from '@/components/ContactList/ImportContactsModal';
import { ContactList } from '@/types/Contact';

const ContactsPage = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const { lists, loading, fetchLists } = useContactLists();
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);

  useEffect(() => {
    if (isAuthenticated) fetchLists();
  }, [isAuthenticated, fetchLists]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D10] text-[#FFFFFF]">
        <p className="text-lg text-[#A0AEC0]">Login to see contact lists</p>
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
    } catch (err) { console.error(err); }
  };

  const handleDeleteList = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      await deleteContactList(id, token);
      fetchLists();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen p-8 bg-[#080D10] text-[#FFFFFF]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-[#FFBD00]">Contact Lists</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New list name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="px-3 py-2 rounded-lg text-[#FFFFFF] bg-[#1F2937] placeholder-[#A0AEC0]"
          />
          <button
            onClick={handleAddList}
            className="bg-[#22C55E] py-2 px-4 rounded-lg hover:bg-[#16A34A] transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[#A0AEC0]">Loading lists...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list: ContactList) => (
            <ContactListCard
              key={list.id}
              list={list}
              onView={(l: ContactList) => setSelectedList(l)}
              onDelete={handleDeleteList}
            />
          ))}
        </div>
      )}

      {selectedList && (
        <ImportContactsModal
          list={selectedList}
          onClose={() => setSelectedList(null)}
          onImported={fetchLists}
        />
      )}
    </div>
  );
};

export default ContactsPage;
