import { Registro } from "@/src/interfaces/interfaces";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

const filterModule = (registros: Registro[], showPagos: boolean, setRegistros: (data: Registro[]) => void) => {
  const [filtros, setFiltros] = useState({
    filtro_ano: dayjs().format("YYYY"), // Initialize with current year
    filtro_meses: "",
    filtro_descricao: "",
    filtro_fonte: "",
  });

  const filteredData = useMemo(() => {
    if (!registros || registros.length === 0) return [];

    let result = [...registros];

    if (filtros.filtro_meses) {
      const selectedMonths = filtros.filtro_meses.split(";");
      const targetYear = dayjs(filtros.filtro_ano).year();
      
      result = result.filter(({ dtCorrente }) => {
        const date = dayjs(dtCorrente);
        return selectedMonths.includes(String(date.month() + 1)) && date.year() === targetYear;
      });
    }

    if (filtros.filtro_descricao) {
      const term = filtros.filtro_descricao.toLowerCase();
      const isWildcard = term.includes("*");
      const cleanTerm = term.replace("*", "");

      result = result.filter(({ descricao }) => {
        const descLower = descricao.toLowerCase();
        if (isWildcard) {
          return !descricao.includes(":") && descLower.includes(cleanTerm);
        }
        return descLower.includes(term);
      });
    }

    if (filtros.filtro_fonte) {
      const term = filtros.filtro_fonte.toLowerCase();
      result = result.filter(({ fonte }) => fonte.toLowerCase().includes(term));
    }

    if (!showPagos) {
      result = result.filter(({ ehPago }) => !ehPago);
    }

    return result.sort((a, b) => {
      const valA = a.dtCorrente?.valueOf() || 0;
      const valB = b.dtCorrente?.valueOf() || 0;
      return valA - valB;
    });
  }, [registros, filtros, showPagos]);

  useEffect(() => {
    setRegistros(filteredData);
  }, [filteredData, setRegistros]);

  return { filtros, setFiltros };
};

export default filterModule;