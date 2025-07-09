export interface User {
  name: string;
  email: string;
  username: string; // Esta é a propriedade que estava faltando
  password?: string; // O '?' torna a senha opcional, já que não queremos armazená-la sempre
}
