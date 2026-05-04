import { Registro } from "../entities/Registro";

export interface RegistroRepository {
  fileId: string;
  getAll(): Promise<Registro[]>;
  add(registros: Registro[]): Promise<void>;
  update(registros: Registro[]): Promise<void>;
  remove(registroId: string): Promise<void>;
  createFile(name: string, initialContent: string): Promise<{ id: string }>; 
  listFiles(): Promise<Array<{ id?: string; name?: string }>>;
  updateAllIdComum(idCommon: string, newValue: Pick<Registro, "descricao" | "valor" | "ehPago">): Promise<any>;
}
