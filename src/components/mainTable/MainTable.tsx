"use client";
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
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import MyBarChart from "../../chart/barChart";
import { Registro } from "../../interfaces/interfaces";
import { useRegistro } from "../../context/RegistroContext";
import { GoogleDriveInvestmentRepository } from "../../adapters/drive/GoogleDriveInvestmentRepository";
import { InvestmentUseCase } from "../../domain/usecases/InvestmentUseCase";
import {
  containsSalario,
  obterPorcentagemDaCompra,
  obterPorcentagemSemanalDaCompra,
  obterRestante,
} from "../../domain/services/FinanceService";
import AddFonteModal from "./components/AddNewFonte";
import Filter from "./components/Filter";
import filterModule from "./components/Filter.module";
import "./components/filter.css";
import InvestmentTable from "./InvestmentTable";

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

export default function MainTable({ fileId }: { fileId: string }) {
  const { useCase } = useRegistro();
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

  const [currentTab, setCurrentTab] = useState(0);
  const [investmentFileId, setInvestmentFileId] = useState("");

  const { filtros, setFiltros } = filterModule(
    rows,
    showPagos,
    setFilteredRows
  );

  const formatDate = (dt: Dayjs, i: number) => {
    return dt.add(i, "months");
  };

  const add = async () => {
    if (isCallingAPI) return;

    let parsedNewRow: Registro[] = [];
    const idComum = uuidv4();
    try {
      setIsCallingAPI(true);
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
              dtCorrente: formatDate(newRow.dtCorrente, currentParcela),
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
              dtCorrente: formatDate(newRow.dtCorrente, currentParcela),
              id: uuidv4(),
              idComum,
              parcelaAtual: currentParcela + 1,
              dtEfetiva,
              comentario: ""
            });


      const newRows = [...rows, newRow];

      await persistInBulk(parsedNewRow);
      setRows(newRows);
      setFilteredRows([...parsedNewRow, ...filteredRows]);
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

    if (type === "data") return dayjs(row[propertyName]).format("DD/MM/YYYY");

    if (type === "number") return parseFloat(row[propertyName]).toFixed(2);

    if (!type) return row[propertyName];
  };

  useEffect(() => {
    getPersisted();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("filtro"))
      setFiltros(JSON.parse(localStorage.getItem("filtro")));
  }, [isLoading]);

  const getPersisted = async () => {
    setIsLoading(true);
    try {
      const rows = await useCase.getAll(fileId);
      if (!rows || rows.length == 0) return;

      setRows(rows);

      const investmentRepository = new GoogleDriveInvestmentRepository();
      const investmentUseCase = new InvestmentUseCase(investmentRepository);
      const invFileId = await investmentUseCase.createOrOpenInvestmentFile();
      setInvestmentFileId(invFileId);
    } catch (err) {
      alert(JSON.stringify(err));
    } finally {
      setIsLoading(false);
    }
  };

  const persist = async (toBePersisted: Registro, method = "POST") => {
    if (method === "PUT") {
      await useCase.update(fileId, [toBePersisted]);
    } else {
      await useCase.add(fileId, [toBePersisted]);
    }
  };

  const persistInBulk = async (toBePersisted: Registro[]) => {
    await useCase.add(fileId, toBePersisted);
  };

  const deleteRow = async (id: string) => {
    await useCase.remove(fileId, id);
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

        await useCase.update(fileId, modifiedItems);
        setFilteredRows(
          filteredRows.map((filtered) =>
            selectedItems.indexOf(filtered.id) !== -1
              ? { ...filtered, ehPago: isPagar }
              : filtered
          )
        );
        setSelectedItems([]);
      };

      const executarIndividual = async () => {
        const updatedRow = { ...row, ehPago: !row.ehPago };
        await useCase.update(fileId, [updatedRow]);
        setFilteredRows(
          filteredRows.map((filtered) =>
            filtered.id !== row.id ? filtered : updatedRow
          )
        );
      };

      if (row) await executarIndividual();
      else await executarSelecionados();
    } catch (err) {
      alert(
        `Ocorreu um erro ao ${isPagar ? "Marcar" : "Desmarcar"} o registro`
      );
      console.error(err);
    } finally {
      setIsPaying({ loading: false });
    }
  };

  useEffect(() => {
    console.log(filteredRows);
  }, [filteredRows]);

  return (
    <div>
      <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
        <Tab label="Registros" />
        <Tab label="Investimentos" />
      </Tabs>

      {currentTab === 0 && (
        <>
          <MyBarChart
            data={rows}
            setFilteredMonth={(newVlr) => {
              const newFiltro = {
                ...filtros,
                filtro_meses: newVlr,
              };
              setFiltros(newFiltro);
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
        setFiltros={setFiltros}
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
                      containsSalario(newRow.descricao)
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
              <TextField
                id="outlined-basic"
                label="Categoria"
                variant="outlined"
                onChange={(e) =>
                  setNewRow({ ...newRow, categoria: e.target.value })
                }
              />
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
                  {fonteList.map((ftItem) => (
                    <MenuItem value={ftItem}>{ftItem}</MenuItem>
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
              % do Total:
              {obterPorcentagemDaCompra(newRow, filteredRows)}
            </TableCell>
            <TableCell colSpan={2}>
              % do total Semanal:
              {obterPorcentagemSemanalDaCompra(newRow, filteredRows)}
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
                <Box display="flex" justifyContent="space-around" flexWrap="wrap">
                  <span>Restante: {obterRestante(filteredRows)}</span>
                  <span>A ser investido: {(() => {
                    const totalSalario = filteredRows
                      .filter((x) => containsSalario(x.descricao))
                      .reduce((a, c) => a + parseFloat(c.valor as any), 0);
                    const result = -1 * (0.2 * totalSalario);
                    return result.toFixed(2);
                  })()}</span>
                  <span>Restante - Invest: {(() => {
                    const totalSalario = filteredRows
                      .filter((x) => containsSalario(x.descricao))
                      .reduce((a, c) => a + parseFloat(c.valor as any), 0);
                    const totalInvestimento = -1 * (0.2 * totalSalario);
                    const minhasDespesas = parseFloat(
                      filteredRows
                        .filter((x) => !containsSalario(x.descricao))
                        .reduce((a, c) => {
                          return (parseFloat(a as any) +
                            parseFloat(
                              c.valor > 0 ? c.valor : (0 as any)
                            )) as any;
                        }, 0)
                    );
                    const result =
                      -1 * totalSalario - minhasDespesas - totalInvestimento;
                    return result.toFixed(2);
                  })()}</span>
                  <span>Minhas despesas: {parseFloat(
                    filteredRows
                      .filter((x) => !containsSalario(x.descricao))
                      .reduce((a, c) => {
                        return (parseFloat(a as any) +
                          parseFloat(c.valor > 0 ? c.valor : (0 as any))) as any;
                      }, 0)
                  ).toFixed(2)}</span>
                  <span>Salário: {(() => {
                    const totalSalario = filteredRows
                      .filter((x) => containsSalario(x.descricao))
                      .reduce((a, c) => a + parseFloat(c.valor as any), 0);
                    const result = -1 * totalSalario;
                    return result.toFixed(2);
                  })()}</span>
                  <span>Total: {parseFloat(
                    filteredRows
                      .filter((x) => !containsSalario(x.descricao))
                      .reduce((a, c) => {
                        return (parseFloat(a as any) +
                          parseFloat(c.valor as any)) as any;
                      }, 0)
                  ).toFixed(2)}</span>
                  <span>Soma: {parseFloat(
                    filteredRows
                      .filter((x) => !containsSalario(x.descricao))
                      .reduce((a, c) => {
                        return (parseFloat(a as any) +
                          Math.abs(parseFloat(c.valor as any))) as any;
                      }, 0)
                  ).toFixed(2)}</span>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                        {filteredRows &&
              filteredRows.map((row) => (
                
                <TableRow
                  //key={row.id}
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
                          {fonteList.map((ftItem) => (
                            <MenuItem value={ftItem}>{ftItem}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      getEditableComponent(row, "Fonte", "fonte")
                    )}
                  </TableCell>
                  <TableCell style={{ padding: 0, width: 120 }}>
                    {getEditableComponent(row, "Categoria", "categoria")}
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
                  <TableCell style={{ width: 40 }}>
                    <ModeEditIcon
                      onClick={() => {
                        if (editRow === row.id) {
                          setEditRow("");
                          persist(row, "PUT");
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
