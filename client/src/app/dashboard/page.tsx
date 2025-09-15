'use client';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Ako korisnik nije prijavljen, preusmjeri na landing page
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // ili loader dok router push ne odradi

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome! Here you can manage your email campaigns and track analytics.</p>
    </div>
  );
};

export default DashboardPage;
