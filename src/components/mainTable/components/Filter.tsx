import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import "./filter.css";

const Filter = ({ setFiltros, filtros, fonteList, setModalOpen }) => {
  return (
    <Box className={"bordered"}>
      <Box className={"d-flex"}> 
         <Select
              labelId="select-label-ano"
              id="select-ano"
              label="Fonte"
              value={filtros.filtro_ano}
              defaultValue="2026"
              onChange={(e) => {
                const newFiltro = {
                  ...filtros,
                  filtro_ano: e.target.value,
                };
                setFiltros(newFiltro);
                localStorage.setItem("filtro", JSON.stringify(newFiltro));
              }}
            >
              <MenuItem value={""}>TODOS</MenuItem>
              {["2023","2024","2025","2026","2027"].map((ftItem) => (
                <MenuItem key={ftItem} value={ftItem}>{ftItem}</MenuItem>
              ))}
            </Select>

            <Select
              labelId="select-label-mes"
              id="select-mes"
              label="Fonte"
              value={filtros.filtro_meses}
              defaultValue="1"
              onChange={(e) => {
                const newFiltro = {
                  ...filtros,
                  filtro_meses: e.target.value,
                };
                setFiltros(newFiltro);
                localStorage.setItem("filtro", JSON.stringify(newFiltro));
              }}
            >
              <MenuItem value={""}>TODOS</MenuItem>
              {["1","2","3","4","5","6","7","8","9","10","11","12"].map((ftItem) => (
                <MenuItem key={ftItem} value={ftItem}>{ftItem}</MenuItem>
              ))}
            </Select>
      
        <TextField
          id="outlined-basic"
          value={filtros.filtro_descricao}
          placeholder="Descrição ou Comentário"
          className={"flex-5"}
          onChange={(e) => {
            const newFiltro = {
              ...filtros,
              filtro_descricao: e.target.value,
            };
            setFiltros(newFiltro);

            localStorage.setItem("filtro", JSON.stringify(newFiltro));
          }}
          variant="outlined"
        />
      </Box>
      <Box className={"alignVertical"}>
        <Box>
          <FormControl size="small">
            <InputLabel id="demo-select-small-label">Fonte</InputLabel>
            <Select
              labelId="select-label"
              id="select"
              label="Fonte"
              sx={{ minWidth: 300 }}
              value={filtros.filtro_fonte}
              defaultValue=""
              onChange={(e) => {
                const newFiltro = {
                  ...filtros,
                  filtro_fonte: e.target.value,
                };
                setFiltros(newFiltro);
                localStorage.setItem("filtro", JSON.stringify(newFiltro));
              }}
            >
              <MenuItem value={""}>TODOS</MenuItem>
              {fonteList.map((ftItem) => (
                <MenuItem key={ftItem} value={ftItem}>{ftItem}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <AddIcon className="mr-1" onClick={() => setModalOpen(true)} />
        
      </Box>
    </Box>
  );
};

export default Filter;
