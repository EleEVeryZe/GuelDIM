import { RegistroRepository } from "../repositories/RegistroRepository";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { Registro } from "../entities/Registro";

export class RegistroUseCase {
  constructor(private repository: RegistroRepository) { }

  async getAll(): Promise<Registro[]> {
    return this.repository.getAll();
  }

  async add(newRow: Registro): Promise<Registro[]> {
    try {
      let parsedNewRow: Registro[] = [];
      const idComum = uuidv4();
      const dtEfetiva = dayjs().toISOString();
      let valorTotal = newRow.valor;

      for (let currentParcela = 0; currentParcela < newRow.qtdParc; currentParcela++) {
        if (!newRow.descricao?.length)
          throw { message: "Campo descrição não pode estar vazio" };

        if (
          newRow.comentario.indexOf("*") !== -1 &&
          newRow.comentario.indexOf(":") !== -1
        ) {
          const devedores = newRow.comentario.replace("*", "").split(",");
          for (let i = 0; i < devedores.length; i++) {
            const e = devedores[i];
            const donoDivida = e.split(":")[0].replaceAll(" ", "");
            const vlrDivida = parseFloat(e.split(":")[1]);

            valorTotal = valorTotal - (vlrDivida / newRow.qtdParc);

            parsedNewRow.push({
              ...newRow,
              descricao: donoDivida + ": " + newRow.descricao,
              valor: -1 * vlrDivida / newRow.qtdParc,
              dtCorrente: newRow.dtCorrente.add(currentParcela, "months"),
              id: uuidv4(),
              idComum,
              parcelaAtual: currentParcela + 1,
              dtEfetiva,
              comentario: ""
            });
          }
        }
      }

      if (valorTotal > 0 || newRow.descricao.indexOf(":") !== -1 || newRow.descricao.toLowerCase().indexOf("salario") !== -1)
        for (let currentParcela = 0; currentParcela < newRow.qtdParc; currentParcela++)
          parsedNewRow.push({
            ...newRow,
            valor: valorTotal / newRow.qtdParc,
            dtCorrente: newRow.dtCorrente.add(currentParcela, "months"),
            id: uuidv4(),
            idComum,
            parcelaAtual: currentParcela + 1,
            dtEfetiva,
            comentario: ""
          });


      await this.repository.add(parsedNewRow);
      return parsedNewRow;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async update(registros: Registro[]): Promise<void> {
    return this.repository.update(registros);
  }

  /*
    This functions updates all ocorrence of the registers that matches the idCommon passed as argument
  */
  async updateAllIdComum(idCommon: string, newValue: Pick<Registro, "descricao" | "valor" | "ehPago">): Promise<void> {
    return this.repository.updateAllIdComum(idCommon, newValue);
  }

  async remove(registroId: string): Promise<void> {
    return this.repository.remove(registroId);
  }
}
