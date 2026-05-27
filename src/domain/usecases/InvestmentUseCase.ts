import { Investment } from "@/interfaces/interfaces";
import { ItemBaseUseCase } from "./ItemBaseUseCase";
import { ItemBaseRepository } from "@/application/outPort/RegistroRepository";

export class InvestmentUseCase extends ItemBaseUseCase<Investment> {
  constructor(readonly repository: ItemBaseRepository<Investment>) {
    super(repository, null);
  }

  updateAllIdComum(idCommon: string, newValue: Investment): Promise<void> {
    throw new Error("Method not implemented.");
  }
}