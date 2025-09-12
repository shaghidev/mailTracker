// src/types/Campaign.ts
export interface Campaign {
    id: string;
    name: string;
    subject: string;
    html_template: string;
    createdAt: string;
    sent?: number;
    opened?: number;
    clicked?: number;
  }
  