import { useRegistro } from "@/context/RegistroContext";
import { RegistroFilterService } from "@/domain/services/RegistroFilterService";
import { useMemo } from "react";

export const InfoTable = () => {
    const { useCase, filtered } = useRegistro();

    const gastosPorFonte = useMemo(() => {
        return (useCase.itemFilterBaseService as RegistroFilterService).getFinanceService().obterTotalPorFontes();
    }, [filtered, useCase.itemFilterBaseService]); 

    return (
        <table>
            <thead>
                <tr>
                    <th>Gastos por Fonte</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <table>
                            <tbody>
                                {Object.entries(gastosPorFonte).map(([fonte, valor]) => (
                                    <tr key={fonte}>
                                        <td>{fonte}</td>
                                        <td>R$ {valor.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                    
                    <td>
                        <table>
                            <tbody>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};
