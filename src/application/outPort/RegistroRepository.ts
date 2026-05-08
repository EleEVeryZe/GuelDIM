import { Registro } from "../../domain/entities/Registro";

export abstract class RegistroRepository {
  abstract fileId: string;

  static createFile(name: string, initialContent: string): Promise<{ id: string }> {
    throw new Error("Método estático 'createFile()' deve ser implementado pela subclasse.");
  }

  static async listFiles(): Promise<Array<{ id?: string; name?: string }>> {
    throw new Error("Método estático 'listFiles()' deve ser implementado pela subclasse.");
  }

  abstract getAll(): Promise<Registro[]>;
  abstract add(registros: Registro[]): Promise<void>;
  abstract update(registros: Registro[]): Promise<void>;
  abstract remove(registroId: string): Promise<void>;
  abstract updateAllIdComum(registros: Registro[]): Promise<void>;
}