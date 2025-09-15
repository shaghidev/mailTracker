import axios from 'axios';
import { Contact } from '@/types/Contact';

const API_URL = 'https://mailtracker-7jvy.onrender.com';

// --- Contact Lists ---
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

// --- Contacts ---
export const fetchContacts = async (listId: string, token: string) => {
  const { data } = await axios.get(`${API_URL}/api/contact_lists/${listId}/contacts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const addContact = async (listId: string, contact: Contact, token: string) => {
  return axios.post(`${API_URL}/api/contact_lists/${listId}/contacts`, contact, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteContact = async (listId: string, email: string, token: string) => {
  return axios.delete(`${API_URL}/api/contact_lists/${listId}/contacts/${email}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// --- Import Contacts (CSV/Excel) ---
export const importContactsFile = async (listId: string, file: File, token: string) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${API_URL}/api/contact_lists/${listId}/contacts/import`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
