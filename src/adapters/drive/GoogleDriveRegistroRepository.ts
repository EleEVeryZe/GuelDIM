import { Registro } from "../../domain/entities/Registro";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import 'dayjs/locale/pt-br'
import { GoogleDriveRepository } from "./GoogleDriveRepository";

dayjs.extend(minMax);
dayjs.locale('pt-br');

export class GoogleDriveRegistroRepository extends GoogleDriveRepository<Registro> {
  constructor(file: { id: string, name: string } ) {
    super(file.id);
  }

  public static async getInstance(): Promise<GoogleDriveRegistroRepository>  {
    return new GoogleDriveRegistroRepository(await GoogleDriveRepository.getFile('financeiro040520261.geldIn'));
  }
}
