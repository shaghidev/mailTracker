'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const API_URL = 'https://mailtracker-7jvy.onrender.com';

interface ContactList {
  id: string;
  name: string;
  emails: string[];
}

const ContactsPage = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');

  // --- Dohvat lista ---
  const fetchLists = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const { data } = await axios.get(`${API_URL}/api/contact_lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // --- Dodavanje nove liste ---
  const handleAddList = async () => {
    if (!newListName.trim()) return;
    try {
      const token = await getAccessTokenSilently();
      await axios.post(
        `${API_URL}/api/contact_lists`,
        { name: newListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewListName('');
      fetchLists(); // osvježi liste
    } catch (err) {
      console.error(err);
    }
  };

  // --- Brisanje liste ---
  const handleDeleteList = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(`${API_URL}/api/contact_lists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLists(); // osvježi liste
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D10] text-white">
        <p className="text-lg">Login to see contact lists</p>
      </div>
    );

  return (
    <div className="min-h-screen p-8 bg-[#080D10] text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-[#2979FF]">Contact Lists</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New list name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="px-3 py-2 rounded-lg text-black"
          />
          <button
            onClick={handleAddList}
            className="bg-green-600 py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading lists...</p>
      ) : lists.length === 0 ? (
        <p className="text-gray-400">No contact lists found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((l) => (
            <li
              key={l.id}
              className="bg-[#1F2937] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer list-none"
            >
              <h2 className="font-bold text-xl mb-2 text-[#FFBD00]">{l.name}</h2>
              <p className="text-gray-300">{l.emails.length} emails</p>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-[#2979FF] py-2 rounded-lg hover:bg-[#1C5FCC] transition-colors">
                  View
                </button>
                <button
                  onClick={() => handleDeleteList(l.id)}
                  className="flex-1 bg-red-600 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
