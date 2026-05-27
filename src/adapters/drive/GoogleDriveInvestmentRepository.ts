import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import 'dayjs/locale/pt-br'
import { GoogleDriveRepository } from "./GoogleDriveRepository";
import { Investment } from "../../interfaces/interfaces";

dayjs.extend(minMax);
dayjs.locale('pt-br');

export class GoogleDriveInvestmentRepository extends GoogleDriveRepository<Investment> {
  constructor(file: { id: string, name: string } ) {
    super(file.id);
  }

  public static async getInstance(): Promise<GoogleDriveInvestmentRepository>  {
    return new GoogleDriveInvestmentRepository(await GoogleDriveRepository.getFile('investment01.geldIn'));
  }
}
