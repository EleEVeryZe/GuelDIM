import { Investment } from "@/interfaces/interfaces";
import { ItemBaseUseCase } from "./ItemBaseUseCase";
import { ItemBaseRepository } from "@/application/outPort/RegistroRepository";
import { InvestmentFilterService } from "../services/InvestmentFilterService";

export class InvestmentUseCase extends ItemBaseUseCase<Investment> {
  getAdds(item: Investment): Investment[] {
    return [item];
  }
  constructor(readonly repository: ItemBaseRepository<Investment>) {
    super(repository, new InvestmentFilterService());
  }

  updateAllIdComum(idCommon: string, newValue: Investment): Promise<void> {
    throw new Error("Method not implemented.");
  }
}