'use client';
import { useAuth0 } from '@auth0/auth0-react';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;

  return (
    isAuthenticated && (
      <div className="flex flex-col items-center gap-2">
        <img src={user?.picture} alt={user?.name} className="w-16 h-16 rounded-full" />
        <h2 className="font-bold">{user?.name}</h2>
        <p>{user?.email}</p>
      </div>
    )
  );
};

export default Profile;
