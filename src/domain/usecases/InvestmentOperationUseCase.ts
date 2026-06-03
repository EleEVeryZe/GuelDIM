import { ItemBaseUseCase } from "./ItemBaseUseCase";
import { ItemBaseRepository } from "@/application/outPort/RegistroRepository";
import { InvestmentOperation } from "../entities/Investment";
import { InvestmentOperationFilterService } from "../services/InvestmentOperationFilterService";

export class InvestmentOperationUseCase extends ItemBaseUseCase<InvestmentOperation> {
  getAdds(item: InvestmentOperation): InvestmentOperation[] {
    return [item];
  }
  constructor(readonly repository: ItemBaseRepository<InvestmentOperation>) {
    super(repository, new InvestmentOperationFilterService());
  }

  updateAllIdComum(idCommon: string, newValue: InvestmentOperation): Promise<void> {
    throw new Error("Method not implemented.");
  }
}