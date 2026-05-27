import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import 'dayjs/locale/pt-br'
import { GoogleDriveRepository } from "./GoogleDriveRepository";
import { InvestmentOperation } from "@/domain/entities/Investment";

dayjs.extend(minMax);
dayjs.locale('pt-br');

export class GoogleDriveInvestmentOperationRepository extends GoogleDriveRepository<InvestmentOperation> {
  constructor(file: { id: string, name: string } ) {
    super(file.id);
  }

  public static async getInstance(): Promise<GoogleDriveInvestmentOperationRepository>  {
    return new GoogleDriveInvestmentOperationRepository(await GoogleDriveRepository.getFile('investment01.geldIn'));
  }
}
