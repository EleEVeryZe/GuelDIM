import { InvestmentOperation } from "../entities/Investment";

export interface InvestmentOperationRepository {
  getAll(fileId: string): Promise<InvestmentOperation[]>;
  add(fileId: string, operations: InvestmentOperation[]): Promise<void>;
  update(fileId: string, operations: InvestmentOperation[]): Promise<void>;
  remove(fileId: string, operationId: string): Promise<void>;
  createFile(name: string, initialContent: string): Promise<{ id: string }>;
  listFiles(): Promise<Array<{ id?: string; name?: string }>>;
}