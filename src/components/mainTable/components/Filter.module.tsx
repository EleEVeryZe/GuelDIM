import { Registro } from "@/src/interfaces/interfaces";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const filterModule = (registros: Registro[], showPagos: boolean, setRegistros) => {
  const [filtros, setFiltros] = useState<{
    filtro_ano: string;
    filtro_meses: string;
    filtro_descricao: string;
    filtro_fonte: string;
  }>({ filtro_meses: "", filtro_fonte: "", filtro_descricao: "", filtro_ano: "" });

  const filterByMonths = () => {
    if (filtros.filtro_meses)
      return registros.filter(({ dtCorrente }) => {
        const aux = dayjs(dtCorrente).month();
        return (
          filtros.filtro_meses.split(";").indexOf(aux + 1 + "") !== -1 &&
          dayjs(filtros.filtro_ano).year() === dayjs(dtCorrente).year()
        );
      });

    return registros;
  };

  const filterByDescricao = (filtered: Registro[]) => {
    if (filtros.filtro_descricao)
      return (Object.keys(filtered).length ? filtered : registros).filter(
        ({ descricao }) => {
          let byDescricao = descricao.toLowerCase().indexOf(filtros.filtro_descricao.toLowerCase()) !== -1

          if (filtros.filtro_descricao.indexOf("*") !== -1) {
            byDescricao = descricao.indexOf(":") === -1 && descricao.toLowerCase().indexOf(filtros.filtro_descricao.replaceAll("*", "").toLowerCase()) !== -1;
          }
            
          return byDescricao;
        }
      );

    return filtered;
  };

  const filterByFonte = (filtered: Registro[]) => {
    if (filtros.filtro_fonte)
      filtered = (Object.keys(filtered).length ? filtered : registros).filter(
        ({ fonte }) => {
          return (
            fonte.toLowerCase().indexOf(filtros.filtro_fonte.toLowerCase()) !==
            -1
          );
        }
      );

    return filtered;
  };

  const filterEhPago = (filtered: Registro[]) => {
    if (!showPagos)
      filtered = (Object.keys(filtered).length ? filtered : registros).filter(
        ({ ehPago }) => {
          return ehPago === false || !ehPago;
        }
      );

    return filtered;
  };

  const sort = (data: Registro[]) => {
    return data.toSorted((a, b) => {
      if (!b.dtCorrente || a.dtCorrente) return 1;
      if (a.dtCorrente?.valueOf() < b.dtCorrente.valueOf()) return -1;
      if (a.dtCorrente?.valueOf() > b.dtCorrente.valueOf()) return 1;
      return 0;
    });
  };

  useEffect(() => {
    let filtered = filterByMonths();
    filtered = filterByDescricao(filtered);
    filtered = filterByFonte(filtered);
    filtered = filterEhPago(filtered);

    setRegistros(sort(filtered));
  }, [filtros, showPagos]);

  return { filtros, setFiltros };
};

export default filterModule;
