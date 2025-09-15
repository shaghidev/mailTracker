'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

interface ClientAuth0ProviderProps {
  children: React.ReactNode;
}

export default function ClientAuth0Provider({ children }: ClientAuth0ProviderProps) {
  const [redirectUri, setRedirectUri] = useState<string | null>(null);

  useEffect(() => {
    // Ovo se izvršava samo na klijentu, window je definiran
    setRedirectUri(window.location.origin + '/dashboard');
  }, []);

  if (!redirectUri) return null; // loader dok ne dobijemo redirect_uri

  return (
    <Auth0Provider
      domain="mailora.eu.auth0.com"
      clientId="J05ntDwdvNulvF8SLVY0PMiCeu6ij65f"
      authorizationParams={{ redirect_uri: redirectUri }}
    >
      {children}
    </Auth0Provider>
  );
}
