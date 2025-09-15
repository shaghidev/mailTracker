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
      // TODO: pozovi backend API za kreiranje kampanje
      console.log({ name, subject, htmlTemplate });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Create New Campaign</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg flex flex-col gap-6"
      >
        <input
          type="text"
          placeholder="Campaign Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 text-gray-800 transition-colors"
          required
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 text-gray-800 transition-colors"
          required
        />

        <textarea
          placeholder="HTML Template"
          value={htmlTemplate}
          onChange={(e) => setHtmlTemplate(e.target.value)}
          className="border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 text-gray-800 transition-colors h-48 resize-none"
          required
        />

        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>

      {/* ---------------------------- */}
      {/* Live HTML Preview */}
      {/* ---------------------------- */}
      {htmlTemplate && (
        <div className="mt-8 w-full max-w-lg bg-gray-100 p-4 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Live Preview</h2>
          <div
            className="border border-gray-300 p-4 rounded bg-white overflow-auto"
            dangerouslySetInnerHTML={{ __html: htmlTemplate }}
          />
        </div>
      )}
    </div>
  );
};

export default NewCampaignPage;
