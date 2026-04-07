import { Registro } from "@/src/interfaces/interfaces";
import { Box, Button, List, ListItem, Modal, TextField } from "@mui/material";
import { useEffect, useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const AddFonteModal = ({
  isOpenFromOutside,
  registros,
  outsideFonteList,
  setOutsideFonteList,
}: {
  isOpenFromOutside: boolean;
  registros: Registro[];
  outsideFonteList,
  setOutsideFonteList,
}) => {
  const [open, setOpen] = useState(isOpenFromOutside);
  const handleClose = () => setOpen(false);
  const [fonte, setFonte] = useState("");

  useEffect(() => {
    setOpen(isOpenFromOutside);
  }, [isOpenFromOutside]);

  useEffect(() => {
    saveFonteFromRegistros();
  }, [registros]);

  const saveFonteFromRegistros = () => {
    if (!registros) return;
    const fontesFromRegistros = registros
      .map(({ fonte }) => fonte)
      .filter((vlr, idx, arr) => arr.indexOf(vlr) === idx)
      .filter((vlr) => vlr?.length);
    save(fontesFromRegistros);
  };

  const addNewFonte = () => {
    if (!fonte && !fonte.length) return;
    save([fonte]);
    setFonte("");
  };

  const save = (fontes: string[]) => {
    let fontesList = JSON.parse(localStorage.getItem("fontes")) || [];
    fontes.forEach((fts) => fontesList.push(fts));
    fontesList = fontesList.filter((vlr, idx, arr) => arr.indexOf(vlr) === idx)
    if (fontesList?.length) {
        localStorage.setItem("fontes", JSON.stringify(fontesList));
        setOutsideFonteList(fontesList)
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <TextField
          id="outlined-basic"
          value={fonte}
          onChange={(e) => {
            setFonte(e.target.value);
          }}
        />
        <Button onClick={addNewFonte}>Add</Button>

        <Box>
        <List>
          {outsideFonteList?.map((ft) => (
            <ListItem key={ft}>{ft}</ListItem>
          ))}
        </List>
      </Box>
      </Box>
     
    </Modal>
  );
};

export default AddFonteModal;
