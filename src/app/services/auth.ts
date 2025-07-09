export interface User {
  name: string;
  email: string;
  username: string; // ADICIONADO: Esta é a propriedade que estava faltando
  password?: string;
}
