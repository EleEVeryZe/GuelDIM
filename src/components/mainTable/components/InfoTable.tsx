import { useRegistro } from "@/context/RegistroContext";
import { RegistroFilterService } from "@/domain/services/RegistroFilterService";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCallback, useMemo } from "react";
import { RESTANTE_INVESTIMENTO_TARJA } from "@/domain/services/FinanceService";

export const InfoTable = ({ setFiltros, filtros }) => {
    const { useCase, filtered } = useRegistro();

    const obterCorPorTarja = useCallback((tarja: RESTANTE_INVESTIMENTO_TARJA): string => {
        const cores: Record<RESTANTE_INVESTIMENTO_TARJA, string> = {
            [RESTANTE_INVESTIMENTO_TARJA.TRANQUILO]: "#2e7d32",
            [RESTANTE_INVESTIMENTO_TARJA.ALERTA]: "#ed6c02",
            [RESTANTE_INVESTIMENTO_TARJA.PERIGOSO]: "#d32f2f",
        };
        return cores[tarja] || "inherit";
    }, []);

    const financialSummary = useMemo(() => {
        const financeService = (useCase.itemFilterBaseService as RegistroFilterService).getFinanceService();

        return {
            catPoupanca: financeService.obterPorcentagemPorCategoria("poupanca"),
            catVariaveis: financeService.obterPorcentagemPorCategoria("despesas_variaveis"),
            catLazer: financeService.obterPorcentagemPorCategoria("lazer"),
            catFixas: financeService.obterPorcentagemPorCategoria("despesas_fixas"),
            totalPorFontes: (useCase.itemFilterBaseService as RegistroFilterService).getFinanceService().obterTotalPorFontes(),
            restante: financeService.obterRestante(),
            totalInvestimento: financeService.obterTotalInvestimento(),
            restanteMenosInvestimento: financeService.obterRestanteMenosMinInvestimento(),
            minhasDespesas: financeService.obterMinhasDespesas(),
            totalSalario: financeService.obterTotalSalario(),
            somaDespesasAbsolutas: financeService.obterSomaDespesasAbsolutas(),
            totalMinimoInvestimento: financeService.obterTotalMinimoInvestimento(),
            corTarjaMinInvestimento: obterCorPorTarja(financeService.obterTarjaRestante())
        };
    }, [filtered, useCase.itemFilterBaseService, obterCorPorTarja]);


    return (
        <Box sx={{ width: '100%', p: 1 }}>
            {/* O Accordion começa fechado por padrão. Se quisesse aberto, usaria defaultExpanded */}
            <Accordion variant="outlined" sx={{ borderRadius: 1 }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel-content"
                    id="panel-header"
                >
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Visualizar Resumo e Gastos por Fonte
                    </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 2 }}>
                    <Grid container spacing={3} alignItems="stretch">

                        {/* Tabela Esquerda: Resumo Financeiro */}
                        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle1" component="h3" sx={{ mb: 2, fontWeight: 'medium' }}>
                                Resumo Financeiro
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Table aria-label="resumo financeiro" size="small" sx={{ flexGrow: 1 }}>
                                    <TableHead sx={{ backgroundColor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell><strong>Métrica</strong></TableCell>
                                            <TableCell align="right"><strong>Valor (R$)</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow hover>
                                            <TableCell>Restante</TableCell>
                                            <TableCell align="right">R$ {financialSummary.restante.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell>A ser investido</TableCell>
                                            <TableCell align="right">R$ {financialSummary.totalInvestimento.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell>
                                                Mínimo a ser investido
                                            </TableCell>
                                            <TableCell align="right">
                                                R$ {financialSummary.totalMinimoInvestimento.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell style={{ color: financialSummary.corTarjaMinInvestimento, fontWeight: 'bold' }}>Restante - Invest</TableCell>
                                            <TableCell align="right" style={{ color: financialSummary.corTarjaMinInvestimento, fontWeight: 'bold' }}>R$ {financialSummary.restanteMenosInvestimento.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell>Minhas despesas</TableCell>
                                            <TableCell align="right">R$ {financialSummary.minhasDespesas.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell>Salário</TableCell>
                                            <TableCell align="right">R$ {(-1 * financialSummary.totalSalario).toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow hover>
                                            <TableCell>Soma</TableCell>
                                            <TableCell align="right">R$ {financialSummary.somaDespesasAbsolutas.toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        {/* Tabela Direita: Gastos por Fonte */}
                        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="subtitle1" component="h3" sx={{ mb: 2, fontWeight: 'medium' }}>
                                Gastos por Fonte
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Table aria-label="gastos por fonte" size="small" sx={{ flexGrow: 1 }}>
                                    <TableHead sx={{ backgroundColor: 'action.hover' }}>
                                        <TableRow>
                                            <TableCell><strong>Fonte</strong></TableCell>
                                            <TableCell align="right"><strong>Valor</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(financialSummary.totalPorFontes).map(([fonte, valor]) => (
                                            <TableRow
                                                key={fonte}
                                                hover
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    const newFiltro = {
                                                        ...filtros,
                                                        filtro_fonte: fonte
                                                    };
                                                    setFiltros(newFiltro);
                                                    localStorage.setItem("filtro", JSON.stringify(newFiltro));
                                                }}
                                            >
                                                <TableCell>{fonte}</TableCell>
                                                <TableCell align="right">R$ {(valor as number).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
