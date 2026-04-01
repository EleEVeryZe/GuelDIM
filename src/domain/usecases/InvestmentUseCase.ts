import { InvestmentRepository } from "../repositories/InvestmentRepository";
import { Investment } from "../entities/Investment";

export class InvestmentUseCase {
  constructor(private repository: InvestmentRepository) {}

  async getAll(fileId: string): Promise<Investment[]> {
    return this.repository.getAll(fileId);
  }

  async add(fileId: string, investments: Investment[]): Promise<void> {
    return this.repository.add(fileId, investments);
  }

  async update(fileId: string, investments: Investment[]): Promise<void> {
    return this.repository.update(fileId, investments);
  }

  async remove(fileId: string, investmentId: string): Promise<void> {
    return this.repository.remove(fileId, investmentId);
  }

  async createOrOpenInvestmentFile(): Promise<string> {
    const files = await this.repository.listFiles();

    const dataFile = files.find((file) => file.name === "investments.geldIn");

    if (dataFile?.id) {
      return dataFile.id;
    }

    const created = await this.repository.createFile("investments.geldIn", "[]");
    return created.id;
  }
}