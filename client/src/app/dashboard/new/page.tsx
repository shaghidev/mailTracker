'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';

const NewCampaignPage = () => {
  const { isAuthenticated } = useAuth0();
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      console.log({ name, subject, htmlTemplate });
      router.push('/dashboard');
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
