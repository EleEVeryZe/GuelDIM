import { RegistroRepository } from "../repositories/RegistroRepository";
import { Registro } from "../entities/Registro";
import data from './data.json';

export class RegistroUseCase {
  fileName = 'financeiro080420261.geldIn';
  constructor(private repository: RegistroRepository) {}

  async getAll(fileId: string): Promise<Registro[]> {
    return this.repository.getAll(fileId);
  }

  async add(fileId: string, registros: Registro[]): Promise<void> {
    return this.repository.add(fileId, registros);
  }

  async update(fileId: string, registros: Registro[]): Promise<void> {
    return this.repository.update(fileId, registros);
  }

  async remove(fileId: string, registroId: string): Promise<void> {
    return this.repository.remove(fileId, registroId);
  }

  async createOrOpenDataFile(): Promise<string> {
    const files = await this.repository.listFiles();

    const dataFile = files.find((file) => file.name === this.fileName);

    if (dataFile?.id) {
      return dataFile.id;
    }

    const created = await this.repository.createFile(this.fileName, JSON.stringify(data));
    return created.id;
  }
}
