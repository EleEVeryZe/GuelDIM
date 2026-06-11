"use client";
import CloseIcon from "@mui/icons-material/Close";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Fab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Investment, InvestmentOperation } from "../../interfaces/interfaces";
import { useInvestment } from "@/context/InvestmentContext";
import { useInvestmentOperation } from "@/context/InvestmentOperationContext";

function createInvestmentData(
  id: string,
  name: string,
  total: number,
  date: Dayjs,
  category: string,
  comment: string
) {
  return {
    id,
    name,
    total,
    date,
    category,
    comment,
  };
}

function createOperationData(
  id: string,
  investmentId: string,
  amount: number,
  date: Dayjs,
  type: 'deposit' | 'withdraw',
  comment: string
) {
  return {
    id,
    investmentId,
    amount,
    date,
    type,
    comment,
  };
}

const initialInvestments = [] as Investment[];
const initialOperations = [] as InvestmentOperation[];

export default function InvestmentTable() {
  const { useCase: investmentUseCase, allItems: allInvestment, isWritingToApi: isWritingToInvestment, isLoadingFile: isLoadingInvestmentFile, remove: removeInvestment, add: addInvestiment, update: updateInvestment } = useInvestment();
  const { useCase: operationUseCase, allItems: allOperation, isWritingToApi: isWritingToOperation, isLoadingFile: isLoadingOperationFile, remove: removeOperation, add: addOperation, update: updateOperation } = useInvestmentOperation();


  const [investments, setInvestments] = useState(initialInvestments);
  const [operations, setOperations] = useState(initialOperations);
  const [filteredInvestments, setFilteredInvestments] = useState(initialInvestments);
  const [editInvestment, setEditInvestment] = useState("");
  const [filterName, setFilterName] = useState("");
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState("");
  const [totalInvestido, setTotalInvestido] = useState(0);
  const [lastUpdatedInvestment, setLastUpdatedInvestment] = useState<Investment | null>(null);
  const [loadingInvestmentId, setLoadingInvestmentId] = useState<string | null>(null);

  useEffect(() => {
    getAll();
  }, [isWritingToInvestment, isWritingToOperation]);

  useEffect(() => {
    setInvestments(allInvestment);
    setFilteredInvestments(allInvestment);
    setTotalInvestido(allInvestment.reduce((total, inv) => total + inv.total, 0));
  }, [allInvestment])

  useEffect(() => {
    setOperations(allOperation);
  }, [allOperation])

  useEffect(() => {
    getAll();
  }, [isLoadingInvestmentFile, isLoadingOperationFile]);

  function getAll() {
    if (isLoadingInvestmentFile || isLoadingOperationFile) return;
    investmentUseCase.getAll();
    operationUseCase.getAll();
    setLastUpdatedInvestment(investmentUseCase.getLastUpdate());
  }

  useEffect(() => {
    let filtered = investments.filter((inv) =>
      inv.name.toLowerCase().includes(filterName.toLowerCase())
    );
    setFilteredInvestments(filtered);
    setTotalInvestido(filtered.reduce((total, inv) => total + inv.total, 0));
  }, [filterName]);

  useEffect(() => {
    /*
    let active = true;
        return () => {
      active = false;
    };*/
  }, [investments, investmentUseCase]);

  const [newInvestment, setNewInvestment] = useState(
    createInvestmentData(
      "-1",
      "",
      0,
      dayjs().locale("pt-br"),
      "",
      ""
    )
  );

  const [newOperation, setNewOperation] = useState(
    createOperationData(
      "-1",
      "",
      0,
      dayjs().locale("pt-br"),
      "deposit",
      ""
    )
  );

  const persistInvestment = async (investment: Investment, method: "POST" | "PUT") => {
    if (method === "POST") {
      try {
        await addInvestiment(investment);
        setShowAddInvestment(false);
        setShowAddOperation(false);
        setNewOperation(createOperationData("-1", "", 0, dayjs().locale("pt-br"), "deposit", ""));
        setInvestments([...investments, investment]);
      } catch (error) {
        console.error("Error persisting investment:", error);
      }
    } else {
      setLoadingInvestmentId(investment.id);
      try {
        await updateInvestment([investment]);
        setShowAddOperation(false);
        setShowAddInvestment(false);
        setNewInvestment(createInvestmentData("-1", "", 0, dayjs().locale("pt-br"), "", ""));
        setInvestments(investments.map((r) => (r.id === investment.id ? investment : r)));
      } catch (error) {
        console.error("Error persisting investment:", error);
      } finally {
        setLoadingInvestmentId(null);
      }
    }
  };

  const persistOperation = async (operation: InvestmentOperation, method: "POST" | "PUT") => {
    if (method === "POST") {
      try {
        await addOperation(operation);
        setOperations([...operations, operation]);

        const investment = investments.find((i) => i.id === operation.investmentId);
        if (investment) {
          const newTotal =
            operation.type === "deposit"
              ? investment.total + operation.amount
              : investment.total - operation.amount;
          const updatedInvestment = { ...investment, total: newTotal };
          await
            await persistInvestment(updatedInvestment, "PUT");
        }
      } catch (error) {
        console.error("Error persisting operation:", error);
      }
    } else {
      try {
        await updateOperation([operation]);
        setOperations(operations.map((r) => (r.id === operation.id ? operation : r)));
      } catch (error) {
        console.error("Error persisting operation:", error);
      }
    }
  };

  const deleteInvestment = async (id: string) => {
    setLoadingInvestmentId(id);
    try {
      await removeInvestment(id);
      setInvestments(investments.filter((r) => r.id !== id));
      const relatedOps = operations.filter((o) => o.investmentId === id);
      for (const op of relatedOps) {
        try {
          await operationUseCase.remove(op.id);
          setOperations((prevOperations) => prevOperations.filter((r) => r.id !== op.id));
        } catch (error) {
          console.error("Error deleting related operation:", error);
        }
      }
    } catch (error) {
      console.error("Error deleting investment:", error);
    } finally {
      setLoadingInvestmentId(null);
    }
  };

  const deleteOperation = (id: string) => {
    const operation = operations.find(o => o.id === id);
    if (!operation) return;

    removeOperation(id);
    setOperations(operations.filter((r) => r.id !== id));

    const investment = investments.find(i => i.id === operation.investmentId);
    if (investment) {
      const newTotal = operation.type === 'deposit'
        ? investment.total - operation.amount
        : investment.total + operation.amount;
      const updatedInvestment = { ...investment, total: newTotal };
      persistInvestment(updatedInvestment, "PUT");
    }
  };

  const addInvestment = () => {
    if (!newInvestment.name?.length) {
      alert("Campo nome não pode estar vazio");
      return;
    }

    const id = uuidv4();
    const investment: Investment = {
      id,
      name: newInvestment.name,
      total: newInvestment.total,
      date: newInvestment.date,
      category: newInvestment.category,
      comment: newInvestment.comment,
      idComum: "",
      dtEfetiva: dayjs().toISOString(),
    };

    persistInvestment(investment, "POST");
  };

  const addOperationHelper = () => {
    if (!newOperation.amount) {
      alert("Campo valor não pode estar vazio");
      return;
    }

    const id = uuidv4();
    const operation: InvestmentOperation = {
      id,
      investmentId: selectedInvestmentId,
      amount: newOperation.amount,
      date: newOperation.date,
      type: newOperation.type,
      comment: newOperation.comment,
      idComum: "",
      dtEfetiva: dayjs().toISOString()
    };

    persistOperation(operation, "POST");
  };

  const getEditableComponent = (
    row: any,
    label: string,
    propertyName: string,
    type = ""
  ) => {
    const isEditing = editInvestment === row.id;
    if (!isEditing) {
      if (type === "date") {
        return dayjs(row[propertyName]).format("DD/MM/YYYY");
      }
      if (type === "number") {
        return parseFloat(row[propertyName]).toFixed(2);
      }
      return row[propertyName];
    }

    if (type === "date") {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            format="DD/MM/YYYY"
            value={dayjs(row[propertyName])}
            onChange={(value) => {
              const updated = { ...row, [propertyName]: dayjs(value) };
              setFilteredInvestments(
                filteredInvestments.map((x) => (x.id === row.id ? updated : x))
              );
            }}
          />
        </LocalizationProvider>
      );
    }

    if (type === "number") {
      return (
        <TextField
          type="number"
          value={row[propertyName]}
          onChange={(e) => {
            const updated = { ...row, [propertyName]: parseFloat(e.target.value) };
            setFilteredInvestments(
              filteredInvestments.map((x) => (x.id === row.id ? updated : x))
            );
          }}
        />
      );
    }

    return (
      <TextField
        value={row[propertyName]}
        onChange={(e) => {
          const updated = { ...row, [propertyName]: e.target.value };
          setFilteredInvestments(
            filteredInvestments.map((x) => (x.id === row.id ? updated : x))
          );
        }}
      />
    );
  };


  return (
    <div>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>

        <TextField
          label="Filtrar por Nome"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddInvestment(true)}
        >
          Novo Investimento
        </Button>
        <Box sx={{ fontWeight: 'bold', fontSize: '1.2em' }}>
          Total Investido: R$ {totalInvestido.toFixed(2)}
        </Box>
      </Box>

      {/* Dialog for adding investment */}
      <Dialog open={showAddInvestment} onClose={() => setShowAddInvestment(false)}>
        <DialogTitle>Novo Investimento</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Investimento"
            fullWidth
            variant="outlined"
            onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Valor Inicial"
            type="number"
            fullWidth
            variant="outlined"
            onChange={(e) =>
              setNewInvestment({ ...newInvestment, total: parseFloat(e.target.value) })
            }
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Data"
              format="DD/MM/YYYY"
              value={newInvestment.date}
              onChange={(value) => setNewInvestment({ ...newInvestment, date: dayjs(value) })}
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            label="Categoria"
            fullWidth
            variant="outlined"
            onChange={(e) => setNewInvestment({ ...newInvestment, category: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Comentário"
            fullWidth
            variant="outlined"
            onChange={(e) => setNewInvestment({ ...newInvestment, comment: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddInvestment(false)}>Cancelar</Button>
          <Button disabled={isWritingToInvestment} onClick={addInvestment}>Adicionar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding operation */}
      <Dialog open={showAddOperation} onClose={() => setShowAddOperation(false)}>
        <DialogTitle>Nova Operação</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={newOperation.type}
              label="Tipo"
              onChange={(e) => setNewOperation({ ...newOperation, type: e.target.value as 'deposit' | 'withdraw' })}
            >
              <MenuItem value="deposit">Depósito</MenuItem>
              <MenuItem value="withdraw">Saque</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Valor"
            type="number"
            fullWidth
            variant="outlined"
            onChange={(e) =>
              setNewOperation({ ...newOperation, amount: parseFloat(e.target.value) })
            }
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Data"
              format="DD/MM/YYYY"
              value={newOperation.date}
              onChange={(value) => setNewOperation({ ...newOperation, date: dayjs(value) })}
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            label="Comentário"
            fullWidth
            variant="outlined"
            onChange={(e) => setNewOperation({ ...newOperation, comment: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddOperation(false)}>Cancelar</Button>
          <Button disabled={isWritingToInvestment} onClick={addOperationHelper}>Adicionar</Button>
        </DialogActions>
      </Dialog>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "68vh",
          overflow: "auto",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        }}
      >
        <Table stickyHeader sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Nome</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Comentário</TableCell>
              <TableCell>Operações</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvestments.map((investment) => (
              <TableRow key={investment.id}>
                <TableCell style={{ width: 200 }}>
                  {getEditableComponent(investment, "Nome", "name")}
                </TableCell>
                <TableCell style={{ width: 100 }}>
                  {getEditableComponent(investment, "Total", "total", "number")}
                </TableCell>
                <TableCell style={{ width: 120 }}>
                  {getEditableComponent(investment, "Data", "date", "date")}
                </TableCell>
                <TableCell style={{ width: 150 }}>
                  {getEditableComponent(investment, "Categoria", "category")}
                </TableCell>
                <TableCell style={{ width: 200 }}>
                  {getEditableComponent(investment, "Comentário", "comment")}
                </TableCell>
                <TableCell style={{ width: 150 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedInvestmentId(investment.id);
                      setShowAddOperation(true);
                    }}
                  >
                    + Operação
                  </Button>
                  <Box sx={{ mt: 1, maxHeight: 100, overflow: 'auto' }}>
                    {operations
                      .filter(op => op.investmentId === investment.id)
                      .map(op => (
                        <Box key={op.id} sx={{ fontSize: '0.8em', mb: 0.5 }}>
                          {op.type === 'deposit' ? '+' : '-'}{op.amount.toFixed(2)} ({dayjs(op.date).format('DD/MM')})
                          <CloseIcon
                            sx={{ fontSize: '0.8em', ml: 0.5, cursor: 'pointer' }}
                            onClick={() => deleteOperation(op.id)}
                          />
                        </Box>
                      ))}
                  </Box>
                </TableCell>
                <TableCell style={{ width: 100 }}>
                  {loadingInvestmentId === investment.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <>
                      <ModeEditIcon
                        onClick={() => {
                          if (editInvestment === investment.id) {
                            setEditInvestment("");
                            persistInvestment(investment, "PUT");
                          } else setEditInvestment(investment.id);
                        }}
                        sx={{ cursor: 'pointer', mr: 1 }}
                      />
                      <CloseIcon
                        onClick={() => deleteInvestment(investment.id)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {
        lastUpdatedInvestment &&
        <p>Última atualização às {dayjs(lastUpdatedInvestment.dtEfetiva).format('hh:mm DD/MM/YY')} registro: {lastUpdatedInvestment.name}</p>

      }
    </div>
  );
}