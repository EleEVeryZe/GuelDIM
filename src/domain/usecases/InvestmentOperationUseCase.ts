import { InvestmentOperationRepository } from "../repositories/InvestmentOperationRepository";
import { InvestmentOperation } from "../entities/Investment";

export class InvestmentOperationUseCase {
  constructor(private repository: InvestmentOperationRepository) {}

  async getAll(fileId: string): Promise<InvestmentOperation[]> {
    return this.repository.getAll(fileId);
  }

  async add(fileId: string, operations: InvestmentOperation[]): Promise<void> {
    return this.repository.add(fileId, operations);
  }

  async update(fileId: string, operations: InvestmentOperation[]): Promise<void> {
    return this.repository.update(fileId, operations);
  }

  async remove(fileId: string, operationId: string): Promise<void> {
    return this.repository.remove(fileId, operationId);
  }

  async createOrOpenInvestmentOperationsFile(): Promise<string> {
    const files = await this.repository.listFiles();

    const dataFile = files.find((file) => file.name === "investment-operations.geldIn");

    if (dataFile?.id) {
      return dataFile.id;
    }

    const created = await this.repository.createFile("investment-operations.geldIn", "[]");
    return created.id;
  }
}