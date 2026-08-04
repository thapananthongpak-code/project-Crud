export type Phone = {
  id: string;
  name: string;
  sect: string;
  tel: string;
};

/** Everything about a contact except the server-assigned identity. */
export type PhoneDraft = Omit<Phone, "id">;
