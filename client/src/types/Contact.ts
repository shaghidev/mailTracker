export interface Contact {
  id?: string;
  name: string;
  email: string;
  company?: string;
  product?: string;
  address?: string;
  website?: string;
  phone?: string;
  title?: string;
  city?: string;
  country?: string;
}


export interface ContactList {
  id: string;
  name: string;
  emails?: string[]; // stavi opcionalno

}
