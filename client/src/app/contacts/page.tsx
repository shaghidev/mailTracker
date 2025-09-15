'use client';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchLists = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get(`${API_URL}/api/contact_lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLists(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (!isAuthenticated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D10] text-white">
        <p className="text-lg">Login to see contact lists</p>
      </div>
    );

  return (
    <div className="min-h-screen p-8 bg-[#080D10] text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-[#2979FF]">Contact Lists</h1>

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
                <button className="flex-1 bg-red-600 py-2 rounded-lg hover:bg-red-700 transition-colors">
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
