import { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Contact } from '@/types/Contact';
import * as contactService from '@/services/contactService';

export const useContactList = (listId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const data = await contactService.fetchContacts(listId, token);
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [listId, getAccessTokenSilently]);

  const addContact = async (contact: Contact) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await contactService.addContact(listId, contact, token);
      setContacts(prev => [...prev, res.data]);
    } catch (err) { console.error(err); }
  };

  const importContacts = async (newContacts: Contact[]) => {
    try {
      const token = await getAccessTokenSilently();
      const res = await contactService.importContacts(listId, newContacts, token);
      setContacts(prev => {
        const existingEmails = new Set(prev.map(c => c.email));
        const unique = res.data.filter((c: Contact) => !existingEmails.has(c.email));
        return [...prev, ...unique];
      });
    } catch (err) { console.error(err); }
  };

  const deleteContact = async (id: string) => {
    try {
      const token = await getAccessTokenSilently();
      await contactService.deleteContact(listId, id, token);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  };

  return { contacts, loading, fetchContacts, addContact, importContacts, deleteContact };
};
