'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';
import { API_URL } from "@/services/api";
import { useContactLists } from '@/hooks/useContactLists';
import { ContactList } from '@/types/Contact';

const NewCampaignPage = () => {
  const { isAuthenticated } = useAuth0();
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [selectedUser, setSelectedUser] = useState('main');
  const [selectedList, setSelectedList] = useState('');
  const [loading, setLoading] = useState(false);

  const users = [
    { id: 'main', label: 'Main Account' },
    { id: 'backup', label: 'Backup Account' },
    { id: 'test', label: 'Test Account' },
  ];

  // --- hook za dinamicko dohvacanje lista kontakata ---
  const { lists, loading: listsLoading, fetchLists } = useContactLists();

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // postavi default listu kad se ucitaju
  useEffect(() => {
    if (lists.length > 0 && !selectedList) {
      setSelectedList(lists[0].id);
    }
  }, [lists, selectedList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/create_campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          html_template: htmlTemplate,
          user: selectedUser,
          contact_list: selectedList
        })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        console.log('Kampanja kreirana', data.campaign_id);
        router.push('/dashboard');
      } else {
        console.error('Error:', data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#080D10] p-6 text-[#FFFFFF]">
      <h1 className="text-4xl font-extrabold mb-8 text-[#FFBD00]">Create New Campaign</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1F2937] p-8 rounded-2xl shadow-lg w-full max-w-lg flex flex-col gap-6"
      >
        <input
          type="text"
          placeholder="Campaign Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-[#2D3748] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] text-[#FFFFFF] placeholder-[#A0AEC0]"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border border-[#2D3748] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] text-[#FFFFFF] placeholder-[#A0AEC0]"
          required
        />
        <textarea
          placeholder="HTML Template"
          value={htmlTemplate}
          onChange={(e) => setHtmlTemplate(e.target.value)}
          className="border border-[#2D3748] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] text-[#FFFFFF] placeholder-[#A0AEC0] h-48 resize-none"
          required
        />

        <div className="bg-[#111827] p-4 rounded-lg flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#FFBD00]">Advanced Options</h2>

          <div>
            <label className="block mb-1 text-sm text-[#A0AEC0]">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-[#2D3748] p-3 rounded-lg bg-[#1F2937] text-white"
            >
              {users.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-[#A0AEC0]">Select Contact List</label>
            {listsLoading ? (
              <p className="text-[#A0AEC0]">Loading lists...</p>
            ) : (
              <select
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                className="w-full border border-[#2D3748] p-3 rounded-lg bg-[#1F2937] text-white"
              >
                {lists.map((cl: ContactList) => (
                  <option key={cl.id} value={cl.id}>{cl.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            loading ? 'bg-[#22C55E] cursor-not-allowed' : 'bg-[#22C55E] hover:bg-[#16A34A]'
          }`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
};

export default NewCampaignPage;
