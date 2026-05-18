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
    this.init();
  }

  async init() {
    const registros = await this.repository.getAll();
    this.itemFilterBaseService.setSourceData(registros);
  }

  getLastUpdate(): Promise<Registro> {
    return this.repository.getLastUpdate();
  }

  getFiltered$(): Observable<Registro[]> {
    return this.itemFilterBaseService.getFiltered$();
  }

  updateFilters(filters: IItemBaseFilter): void {
    this.itemFilterBaseService.updateFilters(filters);
  }

  async getAll(): Promise<Registro[]> {
    const registros = await this.repository.getAll();
    this.itemFilterBaseService.setSourceData(registros);
    return registros;
  }

  async add(newRow: Registro): Promise<Registro[]> {
    try {
      let parsedNewRow: Registro[] = [];
      const idComum = uuidv4();
      const idComumDevedor = uuidv4();
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
            comentario: ""
          });

      await this.repository.add(parsedNewRow);
      const registros = await this.repository.getAll();
      this.itemFilterBaseService.setSourceData(registros);
      return parsedNewRow;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async update(registros: Registro[]): Promise<void> {
    await this.repository.update(registros);
    const updated = await this.repository.getAll();
    this.itemFilterBaseService.setSourceData(updated);
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

  async remove(id: string): Promise<Registro[]> {
    await this.repository.remove(id);
    const updated = await this.repository.getAll();
    this.itemFilterBaseService.setSourceData(updated);
    return updated;
  }
}
