"use client";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CloseIcon from "@mui/icons-material/Close";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  Box,
  Checkbox,
  Fab,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  ToggleButton,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MyBarChart from "../../chart/barChart";
import { Registro } from "../../interfaces/interfaces";
import { useRegistro } from "../../context/RegistroContext";
import { GoogleDriveInvestmentRepository } from "../../adapters/drive/GoogleDriveInvestmentRepository";
import { InvestmentUseCase } from "../../domain/usecases/InvestmentUseCase";
import AddFonteModal from "./components/AddNewFonte";
import Filter from "./components/Filter";
import "./components/filter.css";
import InvestmentTable from "./InvestmentTable";
import IntencaoCompra from '../intencaoCompra';

function createData(
  id: string,
  dtCorrente: Dayjs,
  descricao: string,
  valor: number,
  fonte: string,
  categoria: string | null,
  qtdParc: number,
  parcelaAtual: number,
  comentario: string,
  ehPago: boolean
) {
  return {
    id,
    dtCorrente,
    descricao,
    valor,
    fonte,
    categoria,
    qtdParc,
    parcelaAtual,
    comentario,
    ehPago,
  };
}

const initialRows = [] as Registro[];

export default function MainTable() {
  const { useCase } = useRegistro();
  const [lastUpdated, setLastUpdated] = useState<Registro>()
  const lastUpdatedRef = useRef<Registro>();
  const [selectedItems, setSelectedItems] = useState([] as string[]);
  const [showPagos, setShowPagos] = useState(true);
  const [pagarRegistrosFiltrados, setPagarRegistrosFiltrados] = useState(false);
  const [showAddOrUpdateComponent, setShowAddOrUpdateComponent] =
    useState(false);

  const [newRow, setNewRow] = useState(
    createData(
      "-1",
      dayjs().locale("pt-br"),
      "",
      0,
      "FONTE",
      "",
      1,
      1,
      "",
      false
    )
  );
  const [rows, setRows] = useState(initialRows);
  const [filteredRows, setFilteredRows] = useState(initialRows);
  const [editRow, setEditRow] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [fonteList, setFonteList] = useState<string[]>([]);
  const [isCallingAPI, setIsCallingAPI] = useState(false);

  const [isPaying, setIsPaying] = useState({ loading: false, id: "" } as {
    loading: boolean;
    id?: string;
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [investmentFileId, setInvestmentFileId] = useState("");

  const [filtros, setFiltros] = useState({
    filtro_ano: dayjs().format("YYYY"),
    filtro_meses: "",
    filtro_descricao: "",
    filtro_fonte: "",
    showPagos: true,
  });

  const analiseDeFiltro = useCallback(() => {
    return {
      catPoupanca: useCase.registroFilterService.getFinanceService().obterPorcentagemPorCategoria("poupanca"),
      catVariaveis: useCase.registroFilterService.getFinanceService().obterPorcentagemPorCategoria("despesas_variaveis"),
      catLazer: useCase.registroFilterService.getFinanceService().obterPorcentagemPorCategoria("lazer"),
      catFixas: useCase.registroFilterService.getFinanceService().obterPorcentagemPorCategoria("despesas_fixas"),
      porcentagemSemanal: useCase.registroFilterService.getFinanceService().obterPorcentagemSemanalDaCompra(newRow),
      porcentagemCompra: useCase.registroFilterService.getFinanceService().obterPorcentagemDaCompra(newRow),
      catPorcentagemSalario: filtros.filtro_meses && useCase.registroFilterService.obterTotalSobreSalario(filtros.filtro_meses, filtros.filtro_ano).toFixed(2)
    }
  }, [filteredRows, useCase]);

  const financialSummary = useMemo(() => {
    const financeService = useCase.registroFilterService.getFinanceService();
    return {
      restante: financeService.obterRestante(),
      totalInvestimento: financeService.obterTotalInvestimento(),
      restanteMenosInvestimento: financeService.obterRestanteMenosInvestimento(),
      minhasDespesas: financeService.obterMinhasDespesas(),
      totalSalario: financeService.obterTotalSalario(),
      somaDespesasAbsolutas: financeService.obterSomaDespesasAbsolutas(),
    };
  }, [filteredRows, useCase]);

  const formatCategoria = (categoria: string | null | undefined): string => {
    if (!categoria) return "";

    const value = categoria.toLowerCase();
    switch (value) {
      case "despesas_fixas":
        return "Despesas fixas";
      case "lazer":
        return "Lazer";
      case "despesas_variaveis":
        return "Despesas variables";
      case "poupanca":
      case "poupança":
        return "Poupança";
      default:
        return categoria;
    }
  };

  useEffect(() => {
    const subscription = useCase.getFiltered$().subscribe((filteredData) => {
      useCase.getLastUpdate().then((lastUpdated: Registro) => lastUpdatedRef.current = lastUpdated)
      setLastUpdated(useCase.registroFilterService.getLastUpdate());
      setFilteredRows(filteredData);
    });
    return () => subscription.unsubscribe();
  }, [useCase]);

  const add = async () => {
    try {
      if (isCallingAPI) return;
      setIsCallingAPI(true);
      await useCase.add(newRow);
      setShowAddOrUpdateComponent(false);
    } catch (err) {
      alert(
        err.message
          ? err.message
          : "Ocorreu um erro na hora de gravar a informação"
      );
      console.log(err);
    } finally {
      setIsCallingAPI(false);
    }
  };

  const getEditableComponent = (
    row: Registro,
    label: string,
    propertyName: string,
    type = ""
  ) => {
    if (editRow === row.id)
      return (
        <TextField
          id="outlined-basic"
          label={label}
          variant="outlined"
          sx={{ width: 100 }}
          value={
            typeof row[propertyName] === "number"
              ? parseFloat(row[propertyName] as any).toFixed(2)
              : row[propertyName]
          }
          onChange={(e) => {
            setFilteredRows([
              ...filteredRows.map((x) => {
                if (x.id === editRow)
                  return {
                    ...row,
                    [propertyName]: e.target.value,
                  };
                return x;
              }),
            ]);
          }}
        />
      );

    if (type === "data") return dayjs(row[propertyName]).format("DD/MM/YY");

    if (type === "number") return parseFloat(row[propertyName]).toFixed(2);

    if (!type) {
      return propertyName === "categoria"
        ? formatCategoria(row[propertyName] as string)
        : row[propertyName];
    }
  };

  useEffect(() => {
    getPersisted();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("filtro"))
      handleFilterChange(JSON.parse(localStorage.getItem("filtro")));
  }, [isLoading]);

  const getPersisted = async () => {
    setIsLoading(true);
    try {
      const rows = await useCase.getAll();
      if (!rows || rows.length == 0) return;

      setRows(rows);

      const investmentRepository = new GoogleDriveInvestmentRepository();
      const investmentUseCase = new InvestmentUseCase(investmentRepository);
      const invFileId = await investmentUseCase.createOrOpenInvestmentFile();
      setInvestmentFileId(invFileId);
    } catch (err) {
      console.error(JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRow = async (id: string) => {
    await useCase.remove(id);

    let contador = 1;
    while (contador < 10) {
      console.log(contador);
      contador++;
    }
  };

  const insertOrRemoveSelectedItems = (isInsert: boolean, items: string[]) => {
    if (isInsert) setSelectedItems([...selectedItems, ...items]);
    else
      setSelectedItems(
        selectedItems.filter(
          (selectedItem) => items.indexOf(selectedItem) === -1
        )
      );
  };

  const marcarOuDesmarcarComoPago = async (isPagar, row?: Registro) => {
    try {
      setIsPaying({ loading: true, id: row?.id });

      const executarSelecionados = async () => {
        const modifiedItems = filteredRows
          .filter(
            (filteredItem) => selectedItems.indexOf(filteredItem.id) !== -1
          )
          .map((filtered) => ({ ...filtered, ehPago: isPagar }));

        await useCase.update(modifiedItems);
      };

      const executarIndividual = async () => {
        const updatedRow = { ...row, ehPago: !row.ehPago };
        await useCase.update([updatedRow]);
      };

      if (row) await executarIndividual();
      else await executarSelecionados();
    } catch (err) {
      console.error(
        `Ocorreu um erro ao ${isPagar ? "Marcar" : "Desmarcar"} o registro`
      );
      console.error(err);
    } finally {
      setIsPaying({ loading: false });
    }
  };

  const handleFilterChange = (newFiltros: typeof filtros) => {
    setFiltros(newFiltros);
    useCase.updateFilters(newFiltros);
  };

  return (
    <div>
      <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
        <Tab label="Registros" />
        <Tab label="Investimentos" />
      </Tabs>

      {currentTab === 0 && (
        <>
          <MyBarChart
            useCase={useCase}
            setFilteredMonth={(newVlr) => {
              const newFiltro = {
                ...filtros,
                filtro_meses: newVlr,
              };
              handleFilterChange(newFiltro);
              localStorage.setItem("filtro", JSON.stringify(newFiltro));
            }}
          />
          <Fab
            onClick={() => setShowAddOrUpdateComponent(!showAddOrUpdateComponent)}
            color="primary"
            aria-label="add"
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
            }}
          >
            <AddIcon />
          </Fab>
          <Filter
            setFiltros={handleFilterChange}
            filtros={filtros}
            fonteList={fonteList}
            setModalOpen={setModalOpen}
          />
          <Box sx={{ display: "flex" }}>
            <Box>
              <Checkbox
                onChange={(event) =>
                  insertOrRemoveSelectedItems(
                    event.target.checked,
                    filteredRows.map(({ id }) => id)
                  )
                }
                defaultChecked={false}
              />
            </Box>
            <Box>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      defaultChecked={false}
                      checked={showPagos}
                      onChange={() => setShowPagos((prevSelected) => !prevSelected)}
                    />
                  }
                  label="Exibir pagos"
                />
              </FormGroup>
            </Box>
            <Box sx={{ display: "flex" }}>
              <ToggleButton
                title="Pagar"
                value="check"
                selected={showPagos}
                onChange={() => {
                  marcarOuDesmarcarComoPago(true);
                  setPagarRegistrosFiltrados(!pagarRegistrosFiltrados);
                }}
              >
                Pagar {selectedItems.length}
              </ToggleButton>

              <ToggleButton
                title="Pagar"
                value="check"
                selected={showPagos}
                onChange={() => {
                  marcarOuDesmarcarComoPago(false);
                  setPagarRegistrosFiltrados(!pagarRegistrosFiltrados);
                }}
              >
                Desfazer {selectedItems.length}
              </ToggleButton>
            </Box>
          </Box>
          {showAddOrUpdateComponent ? (
            <Box className="bordered">
              <Box>
                <Box className="d-flex">
                  <div className="flex-1">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Mês"
                        format="DD/MM/YYYY"
                        value={dayjs(newRow.dtCorrente).locale("pt-br")}
                        onChange={(value) => {
                          setNewRow({ ...newRow, dtCorrente: dayjs(value) });
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                  <TextField
                    id="outlined-basic"
                    label="Descrição"
                    className="full-width flex-2"
                    variant="outlined"
                    onChange={(e) =>
                      setNewRow({ ...newRow, descricao: e.target.value })
                    }
                  />
                </Box>
                <Box className="d-flex">
                  <TextField
                    id="outlined-valor-compra"
                    type="number"
                    label="Valor"
                    variant="outlined"
                    onChange={(e) =>
                      setNewRow({
                        ...newRow,
                        valor:
                          newRow.descricao.indexOf(":") !== -1 ||
                            useCase.registroFilterService.getFinanceService().containsSalario(newRow.descricao)
                            ? -1 * parseFloat(e.target.value.replace(",", "."))
                            : parseFloat(e.target.value.replace(",", ".")),
                      })
                    }
                  />

                  <TextField
                    id="outlined-basic"
                    label="Qtd Parcelas"
                    variant="outlined"
                    value={newRow.qtdParc}
                    type="number"
                    onChange={(e) =>
                      setNewRow({
                        ...newRow,
                        qtdParc: parseInt(e.target.value),
                      })
                    }
                  />
                  <FormControl sx={{ minWidth: 180, width: "100%" }} size="medium">
                    <InputLabel id="categoria-select-label">Categoria</InputLabel>
                    <Select
                      labelId="categoria-select-label"
                      id="categoria-select"
                      value={newRow.categoria ?? ""}
                      label="Categoria"
                      renderValue={(value) => formatCategoria(value as string)}
                      onChange={(e) =>
                        setNewRow({ ...newRow, categoria: e.target.value })
                      }
                    >
                      <MenuItem value=""><em>Selecione</em></MenuItem>
                      <MenuItem value="despesas_fixas">Despesas fixas</MenuItem>
                      <MenuItem value="lazer">Lazer</MenuItem>
                      <MenuItem value="despesas_variaveis">Despesas variáveis</MenuItem>
                      <MenuItem value="poupanca">Poupança</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box className="d-flex">
                  <TextField
                    id="outlined-basic"
                    label="Comentário"
                    variant="outlined"
                    onChange={(e) =>
                      setNewRow({ ...newRow, comentario: e.target.value })
                    }
                  />
                  <FormControl sx={{ minWidth: 100, width: "100%" }} size="medium">
                    <InputLabel id="demo-select-small-label">Fonte</InputLabel>
                    <Select
                      labelId="select-label"
                      id="select"
                      label="Fonte"
                      className="select"
                      value={newRow.fonte}
                      defaultValue=""
                      onChange={(e) =>
                        setNewRow({ ...newRow, fonte: e.target.value })
                      }
                    >
                      {fonteList.map((ftItem, i) => (
                        <MenuItem key={i} value={ftItem}>{ftItem}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <div className="txt-right">
                {isCallingAPI ? (
                  <CircularProgress />
                ) : (
                  <AddIcon onClick={() => add()} />
                )}
              </div>
              <Box>
                <TableCell colSpan={2}>
                  Soma Parcelas:
                  {newRow.valor * newRow.qtdParc}
                </TableCell>
                <TableCell colSpan={2}>
                  % do Total: {analiseDeFiltro().porcentagemCompra}
                </TableCell>
                <TableCell colSpan={2}>
                  % do total Semanal: {analiseDeFiltro().porcentagemSemanal}
                </TableCell>
              </Box>
            </Box>
          ) : (
            ""
          )}
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "68vh",
              overflow: "auto",
              borderRadius: "12px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{
                "-webkit-overflow-scrolling": "touch",
                overflow: "auto",
                minWidth: 1100,
              }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell colSpan={11}>
                    <Box display="block" justifyContent="space-around" flexWrap="wrap">
                      <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                        <span>Despesas fixas(35%): {analiseDeFiltro().catFixas}</span>
                        <span>Lazer(30%): {analiseDeFiltro().catLazer}</span>
                        <span>Despesas variáveis(15%): {analiseDeFiltro().catVariaveis}</span>
                        <span>Poupança(20%): {analiseDeFiltro().catPoupanca}</span>
                        <span>% do Salario: {analiseDeFiltro().catPorcentagemSalario}%</span>
                      </Box>

                      <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                        <span>Restante: {financialSummary.restante.toFixed(2)}</span>
                        <span>A ser investido: {financialSummary.totalInvestimento.toFixed(2)}</span>
                        <span>Restante - Invest: {financialSummary.restanteMenosInvestimento.toFixed(2)}</span>
                        <span>Minhas despesas: {financialSummary.minhasDespesas.toFixed(2)}</span>
                        <span>Salário: {(-1 * financialSummary.totalSalario).toFixed(2)}</span>
                        <span>Soma: {financialSummary.somaDespesasAbsolutas.toFixed(2)}</span>
                      </Box>
                      <Box>
                        {
                          lastUpdated &&
                          <span style={{ marginRight: 45 }}>Atualizado: {`${lastUpdated.descricao.slice(0, 10)} - ${dayjs(lastUpdated.dtEfetiva).format('HH:mm DD-MM-YYYY')} - R$${lastUpdated.valor}`}</span>
                        }
                        {
                          lastUpdatedRef.current &&
                          <span>Atualizado Total: {`${lastUpdatedRef.current.descricao.slice(0, 10)} - ${dayjs(lastUpdatedRef.current.dtEfetiva).format('HH:mm DD-MM-YYYY')} - R$${lastUpdatedRef.current.valor}`}</span>
                        }
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows &&
                  filteredRows.map((row, idx) => (
                    <TableRow
                      key={row.id || idx}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        background: row.ehPago ? "#00800038" : "#ffffff",
                        '&:nth-of-type(odd)': {
                          backgroundColor: row.ehPago ? "#00800038" : "#fafafa",
                        },
                      }}
                    >
                      <TableCell style={{ padding: "0 4px", minWidth: 48, width: 48, textAlign: "center" }}>
                        <Checkbox
                          onChange={(event) =>
                            insertOrRemoveSelectedItems(event.target.checked, [row.id])
                          }
                          checked={selectedItems.indexOf(row.id) !== -1}
                          size="small"
                        />
                      </TableCell>
                      <TableCell style={{ padding: 0, width: 100 }}>
                        {getEditableComponent(
                          row,
                          "dtCorrente",
                          "dtCorrente",
                          "data"
                        )}
                      </TableCell>

                      <TableCell style={{ padding: 0, width: 300 }}>
                        {getEditableComponent(row, "descricao", "descricao")}
                      </TableCell>
                      <TableCell style={{ padding: 0, width: 100 }}>
                        {getEditableComponent(row, "Valor", "valor", "number")}
                      </TableCell>
                      <TableCell style={{ padding: 0, width: 120 }}>
                        {editRow === row.id ? (
                          <FormControl
                            sx={{ minWidth: 100, width: "100%" }}
                            size="medium"
                          >
                            <InputLabel id="demo-select-small-label">
                              Fonte
                            </InputLabel>
                            <Select
                              labelId="select-label"
                              id="select"
                              label="Fonte"
                              className="select"
                              value={row.fonte}
                              defaultValue=""
                              onChange={(e) => {
                                setFilteredRows([
                                  ...filteredRows.map((x) => {
                                    if (x.id === editRow)
                                      return {
                                        ...row,
                                        fonte: e.target.value,
                                      };
                                    return x;
                                  }),
                                ]);
                              }}
                            >
                              {fonteList.map((ftItem, i) => (
                                <MenuItem key={i} value={ftItem}>{ftItem}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          getEditableComponent(row, "Fonte", "fonte")
                        )}
                      </TableCell>
                      <TableCell style={{ padding: 0, width: 120 }}>
                        {editRow === row.id ? (
                          <FormControl
                            sx={{ minWidth: 100, width: "100%" }}
                            size="medium"
                          >
                            <InputLabel id={`categoria-select-label-${row.id}`}>
                              Categoria
                            </InputLabel>
                            <Select
                              labelId={`categoria-select-label-${row.id}`}
                              id={`categoria-select-${row.id}`}
                              label="Categoria"
                              value={row.categoria ?? ""}
                              renderValue={(value) => formatCategoria(value as string)}
                              onChange={(e) => {
                                setFilteredRows([
                                  ...filteredRows.map((x) => {
                                    if (x.id === editRow)
                                      return {
                                        ...row,
                                        categoria: e.target.value,
                                      };
                                    return x;
                                  }),
                                ]);
                              }}
                            >
                              <MenuItem value=""><em>Selecione</em></MenuItem>
                              <MenuItem value="despesas_fixas">Despesas fixas</MenuItem>
                              <MenuItem value="lazer">Lazer</MenuItem>
                              <MenuItem value="despesas_variaveis">Despesas variáveis</MenuItem>
                              <MenuItem value="poupanca">Poupança</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          getEditableComponent(row, "Categoria", "categoria")
                        )}
                      </TableCell>
                      <TableCell style={{ width: 80 }}>
                        {editRow !== row.id &&
                          row.parcelaAtual &&
                          row.parcelaAtual + "/"}
                        {getEditableComponent(row, "qtdParc", "qtdParc")}
                      </TableCell>
                      <TableCell style={{ width: 200 }}>
                        {getEditableComponent(row, "Comentário", "comentario")}
                      </TableCell>
                      <TableCell style={{ padding: 0, width: 100 }}>
                        {getEditableComponent(
                          row,
                          "dtEfetiva",
                          "dtEfetiva",
                          "data"
                        )}
                      </TableCell>
                      <TableCell style={{ width: 40 }}>
                        {
                          isUpdating ?
                            <CircularProgress
                              style={{ width: "25px", height: "25px" }}
                            />
                            :
                            <AutoFixHighIcon
                              onClick={async () => {
                                if (editRow === row.id) {
                                  setEditRow("");
                                  setIsUpdating(true);
                                  await useCase.updateAllIdComum(row.idComum, row);
                                  setIsUpdating(false);
                                } else setEditRow(row.id);
                              }}
                            />
                        }
                      </TableCell>
                      <TableCell style={{ width: 40 }}>
                        <ModeEditIcon
                          onClick={async () => {
                            if (editRow === row.id) {
                              await useCase.update([row]);
                              setEditRow("");
                            } else setEditRow(row.id);
                          }}
                        />
                      </TableCell>
                      <TableCell style={{ width: 40 }}>
                        {isPaying.loading && isPaying.id === row.id ? (
                          <CircularProgress
                            style={{ width: "25px", height: "25px" }}
                          />
                        ) : (
                          <AttachMoneyIcon
                            onClick={() => {
                              marcarOuDesmarcarComoPago(!!!row.ehPago, row);
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell style={{ width: 40 }}>
                        <CloseIcon
                          onClick={() => {
                            deleteRow(row.id);
                            setFilteredRows(
                              filteredRows.filter((reg) => row.id != reg.id)
                            );
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          <AddFonteModal
            isOpenFromOutside={isModalOpen}
            registros={rows}
            outsideFonteList={fonteList}
            setOutsideFonteList={setFonteList}
          />
        </>
      )}

      {currentTab === 1 && investmentFileId && <InvestmentTable fileId={investmentFileId} />}
    </div>
  );
}