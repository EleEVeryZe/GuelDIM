import { ItemBaseRepository } from "../../application/outPort/RegistroRepository";
import { Observable } from "rxjs";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { Registro } from "../entities/Registro";
import { ItemBaseUseCase } from "./ItemBaseUseCase";
import { IItemBaseFilter } from "@/interfaces/baseItem";
import { RegistroFilterService } from "../services/RegistroFilterService";

export class RegistroUseCase extends ItemBaseUseCase<Registro> {
  constructor(readonly repository: ItemBaseRepository<Registro>) {
    super(repository, new RegistroFilterService([]));
  }

  getFilter(): RegistroFilterService {
    return this.itemFilterBaseService as RegistroFilterService;
  }

  getFiltered(): Registro[] {
    return this.itemFilterBaseService.getFiltered();
  }

  updateFilters(filters: IItemBaseFilter): void {
    this.itemFilterBaseService.updateFilters(filters);
  }

  getAdds(newRow: Registro): Registro[] {
    try {
      let parsedNewRow: Registro[] = [];
      const idComum = uuidv4();
      const idComumDevedor = uuidv4();
      const dtEfetiva = dayjs().toISOString();
      let valorTotal = newRow.valor;

      const isLoan = newRow.comentario.indexOf("*") !== -1 &&
        newRow.comentario.indexOf(":") !== -1;

      for (let currentParcela = 0; currentParcela < newRow.qtdParc; currentParcela++) {
        if (!newRow.descricao?.length)
          throw { message: "Campo descrição não pode estar vazio" };

        if (isLoan) {
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
              idComum: idComumDevedor,
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
            comentario: isLoan ? '' : newRow.comentario
          });

      return parsedNewRow;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /*
    This functions updates all ocorrence of the registers that matches the idCommon passed as argument
  */
  async updateAllIdComum(idCommon: string, newValue: Pick<Registro, "descricao" | "valor" | "ehPago" | "categoria" | "fonte" | "comentario">): Promise<void> {
    const existing = await this.repository.getAll();

    const updatedRegistries = existing.map(oldVlr => {
      if (oldVlr.idComum === idCommon && dayjs(oldVlr.dtCorrente).isAfter(dayjs().startOf("month"))) {
        const { descricao, valor, ehPago, categoria, fonte, comentario } = newValue;
        return { ...oldVlr, descricao, valor, ehPago, categoria, fonte, comentario };
      }
      return oldVlr;
    });

    await this.repository.updateAllIdComum(updatedRegistries);
    this.itemFilterBaseService.setSourceData(updatedRegistries);
  }
}
