export interface BillingOpsEvent {
  event: string;
  data: Record<string, any>;
  timestamp?: string;
}

export interface UserCreatedEvent extends BillingOpsEvent {
  event: "user.created";
  data: {
    external_user_id: string;
    email: string;
    name?: string;
  };
}

export interface UserUpdatedEvent extends BillingOpsEvent {
  event: "user.updated";
  data: {
    external_user_id: string;
    email?: string;
    name?: string;
  };
}

export type AnyBillingOpsEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | BillingOpsEvent;
