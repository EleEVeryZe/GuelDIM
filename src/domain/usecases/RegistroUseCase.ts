import { RegistroRepository } from "../repositories/RegistroRepository";
import { Registro } from "../entities/Registro";
import data from './data.json';

export class RegistroUseCase {
  fileName = 'financeiro080420261.geldIn';
  constructor(private repository: RegistroRepository) { }

  async getAll(): Promise<Registro[]> {
    return this.repository.getAll();
  }

  async add(registros: Registro[]): Promise<void> {
    return this.repository.add(registros);
  }

  async update(registros: Registro[]): Promise<void> {
    return this.repository.update(registros);
  }

  /*
    This functions updates all ocorrence of the registers that matches the idCommon passed as argument
  */
  async updateAllIdComum(idCommon: string, newValue: Pick<Registro, "descricao" | "valor" | "ehPago">): Promise<void> {
    return this.repository.updateAllIdComum(idCommon, newValue);
  }

  async remove(registroId: string): Promise<void> {
    return this.repository.remove(registroId);
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
