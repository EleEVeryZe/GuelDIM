import { Registro } from "../entities/Registro";

export interface RegistroRepository {
  getAll(fileId: string): Promise<Registro[]>;
  add(fileId: string, registros: Registro[]): Promise<void>;
  update(fileId: string, registros: Registro[]): Promise<void>;
  remove(fileId: string, registroId: string): Promise<void>;
  createFile(name: string, initialContent: string): Promise<{ id: string }>; 
  listFiles(): Promise<Array<{ id?: string; name?: string }>>;
}
