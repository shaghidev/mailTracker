import axios from 'axios';
import { Contact } from '@/types/Contact';

const API_URL = 'https://mailtracker-7jvy.onrender.com';

export const fetchContactLists = async (token: string) => {
  const { data } = await axios.get(`${API_URL}/api/contact_lists`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const addContactList = async (name: string, token: string) => {
  return axios.post(`${API_URL}/api/contact_lists`, { name }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteContactList = async (id: string, token: string) => {
  return axios.delete(`${API_URL}/api/contact_lists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const importContacts = async (listId: string, contacts: Contact[], token: string) => {
  return axios.post(`${API_URL}/api/contacts/import`, {
    listId,
    contacts
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};