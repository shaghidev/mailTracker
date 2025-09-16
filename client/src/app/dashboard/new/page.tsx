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
  { id: 'stream', label: 'Stream (Baltazargrad)', account: 'baltazargrad' },
  { id: 'laser', label: 'Laser (Git)', account: 'git' },
  { id: 'trgovina', label: 'Trgovina (Git)', account: 'git' },
  { id: 'newsletter', label: 'Newsletter (Git)', account: 'git' }
];


  const { lists, loading: listsLoading, fetchLists } = useContactLists();

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

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
        alert(`Kampanja kreirana! Poslano ${data.emails_sent} mailova.`);
        router.push('/dashboard');
      } else {
        console.error('Error:', data.message);
        alert(`Greška: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Greška pri kreiranju kampanje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D10] text-white p-6 flex flex-col items-center gap-10">
      
      {/* --- Page Header --- */}
      <h1 className="text-5xl font-extrabold text-[#FFBD00] text-center">
        Create New Campaign
      </h1>

      {/* --- Form Section --- */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1F2937] w-full max-w-3xl p-8 rounded-2xl shadow-xl flex flex-col gap-6"
      >
        {/* Campaign Name & Subject */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Campaign Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-[#2D3748] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] text-white placeholder-[#A0AEC0]"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 border border-[#2D3748] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] text-white placeholder-[#A0AEC0]"
            required
          />
        </div>

        {/* HTML Template */}
        <textarea
          placeholder="HTML Template"
          value={htmlTemplate}
          onChange={(e) => setHtmlTemplate(e.target.value)}
          className="border border-[#2D3748] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] text-white placeholder-[#A0AEC0] h-48 resize-none"
          required
        />

        {/* Live HTML Preview */}
        <div className="bg-[#111827] p-4 rounded-lg max-h-64 overflow-auto">
          <h2 className="text-lg font-semibold text-[#FFBD00] mb-2">Live Preview</h2>
          <div
            dangerouslySetInnerHTML={{ __html: htmlTemplate }}
            className="prose prose-invert max-h-64 overflow-auto"
            style={{ wordBreak: 'break-word' }}
          />
        </div>

        {/* Advanced Options */}
        <div className="bg-[#111827] p-4 rounded-lg flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#FFBD00]">Advanced Options</h2>

          {/* Select User */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#A0AEC0]">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-[#2D3748] p-3 rounded-lg bg-[#1F2937] text-white"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>

          {/* Select Contact List */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#A0AEC0]">Select Contact List</label>
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

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
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
