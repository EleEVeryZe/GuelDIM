import { Investment } from "../entities/Investment";

export interface InvestmentRepository {
  getAll(fileId: string): Promise<Investment[]>;
  add(fileId: string, investments: Investment[]): Promise<void>;
  update(fileId: string, investments: Investment[]): Promise<void>;
  remove(fileId: string, investmentId: string): Promise<void>;
  createFile(name: string, initialContent: string): Promise<{ id: string }>;
  listFiles(): Promise<Array<{ id?: string; name?: string }>>;
}