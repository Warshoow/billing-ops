export interface Customer {
  id: number;
  externalUserId: string;
  email: string;
  stripeCustomerId: string;
  status: "active" | "at_risk" | "churned";
  lifetimeValue: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export type CustomerStatus = Customer["status"];
