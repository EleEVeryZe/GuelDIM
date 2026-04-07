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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Investment, InvestmentOperation } from "../../interfaces/interfaces";
import { GoogleDriveInvestmentRepository } from "../../adapters/drive/GoogleDriveInvestmentRepository";
import { InvestmentUseCase } from "../../domain/usecases/InvestmentUseCase";
import { GoogleDriveInvestmentOperationRepository } from "../../adapters/drive/GoogleDriveInvestmentOperationRepository";
import { InvestmentOperationUseCase } from "../../domain/usecases/InvestmentOperationUseCase";

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

export default function InvestmentTable({ fileId }: { fileId: string }) {
  const investmentRepository = new GoogleDriveInvestmentRepository();
  const investmentUseCase = new InvestmentUseCase(investmentRepository);
  const operationRepository = new GoogleDriveInvestmentOperationRepository();
  const operationUseCase = new InvestmentOperationUseCase(operationRepository);

  const [investments, setInvestments] = useState(initialInvestments);
  const [operations, setOperations] = useState(initialOperations);
  const [filteredInvestments, setFilteredInvestments] = useState(initialInvestments);
  const [editInvestment, setEditInvestment] = useState("");
  const [filterName, setFilterName] = useState("");
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState("");

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

  const [investmentFileId, setInvestmentFileId] = useState("");
  const [operationFileId, setOperationFileId] = useState("");

  useEffect(() => {
    if (fileId) {
      loadData();
    }
  }, [fileId]);

  useEffect(() => {
    setFilteredInvestments(
      investments.filter((inv) =>
        inv.name.toLowerCase().includes(filterName.toLowerCase())
      )
    );
  }, [investments, filterName]);

  const loadData = async () => {
    try {
      const invFileId = await investmentUseCase.createOrOpenInvestmentFile();
      const opFileId = await operationUseCase.createOrOpenInvestmentOperationsFile();

      setInvestmentFileId(invFileId);
      setOperationFileId(opFileId);

      const invData = await investmentUseCase.getAll(invFileId);
      const opData = await operationUseCase.getAll(opFileId);

      setInvestments(invData);
      setOperations(opData);
    } catch (error) {
      console.error("Error loading investment data:", error);
    }
  };

  const persistInvestment = async (investment: Investment, method: "POST" | "PUT") => {
    try {
      if (method === "POST") {
        await investmentUseCase.add(investmentFileId, [investment]);
        setInvestments([...investments, investment]);
      } else {
        await investmentUseCase.update(investmentFileId, [investment]);
        setInvestments(investments.map((r) => (r.id === investment.id ? investment : r)));
      }
    } catch (error) {
      console.error("Error persisting investment:", error);
    }
  };

  const persistOperation = async (operation: InvestmentOperation, method: "POST" | "PUT") => {
    try {
      if (method === "POST") {
        await operationUseCase.add(operationFileId, [operation]);
        setOperations([...operations, operation]);

        // Update investment total
        const investment = investments.find(i => i.id === operation.investmentId);
        if (investment) {
          const newTotal = operation.type === 'deposit'
            ? investment.total + operation.amount
            : investment.total - operation.amount;
          const updatedInvestment = { ...investment, total: newTotal };
          await persistInvestment(updatedInvestment, "PUT");
        }
      } else {
        await operationUseCase.update(operationFileId, [operation]);
        setOperations(operations.map((r) => (r.id === operation.id ? operation : r)));
      }
    } catch (error) {
      console.error("Error persisting operation:", error);
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      await investmentUseCase.remove(investmentFileId, id);
      setInvestments(investments.filter((r) => r.id !== id));
      // Also delete related operations
      const relatedOps = operations.filter(o => o.investmentId === id);
      for (const op of relatedOps) {
        await operationUseCase.remove(operationFileId, op.id);
      }
      setOperations(operations.filter(o => o.investmentId !== id));
    } catch (error) {
      console.error("Error deleting investment:", error);
    }
  };

  const deleteOperation = async (id: string) => {
    try {
      const operation = operations.find(o => o.id === id);
      if (operation) {
        await operationUseCase.remove(operationFileId, id);
        setOperations(operations.filter((r) => r.id !== id));

        // Update investment total
        const investment = investments.find(i => i.id === operation.investmentId);
        if (investment) {
          const newTotal = operation.type === 'deposit'
            ? investment.total - operation.amount
            : investment.total + operation.amount;
          const updatedInvestment = { ...investment, total: newTotal };
          await persistInvestment(updatedInvestment, "PUT");
        }
      }
    } catch (error) {
      console.error("Error deleting operation:", error);
    }
  };

  const addInvestment = async () => {
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
    };

    await persistInvestment(investment, "POST");
    setShowAddInvestment(false);
    setNewInvestment(createInvestmentData("-1", "", 0, dayjs().locale("pt-br"), "", ""));
  };

  const addOperation = async () => {
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
    };

    await persistOperation(operation, "POST");
    setShowAddOperation(false);
    setNewOperation(createOperationData("-1", "", 0, dayjs().locale("pt-br"), "deposit", ""));
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

  const totalInvestido = investments.reduce((total, inv) => total + inv.total, 0);

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
          <Button onClick={addInvestment}>Adicionar</Button>
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
          <Button onClick={addOperation}>Adicionar</Button>
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
                  <ModeEditIcon
                    onClick={() => {
                      if (editInvestment === investment.id) {
                        setEditInvestment("");
                        persistInvestment(investment, "PUT");
                      } else setEditInvestment(investment.id);
                    }}
                  />
                  <CloseIcon
                    onClick={() => deleteInvestment(investment.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}