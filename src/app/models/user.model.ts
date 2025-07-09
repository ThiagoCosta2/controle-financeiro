// ARQUIVO: src/app/models/user.model.ts

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // A senha é a propriedade que guardamos
}
