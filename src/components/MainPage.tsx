// src/components/MainPage.tsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { RegistroProvider, useRegistro } from "../context/RegistroContext";
import Apresentacao from "./apresentacao/apresentacao";
import MainTable from "./mainTable/MainTable";
import { Box, CircularProgress, Typography } from "@mui/material";

const MainPage: React.FC = () => {
  const { isLoadingFile } = useRegistro();
  const { signIn, signOut } = useContext(AuthContext);

  if (isLoadingFile)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress color="primary" size={60} thickness={4} />
        <Typography variant="body1" color="textSecondary">
          Obtendo arquivo...
        </Typography>
      </Box>
    );

  return <section>
    <div className="mb-4 txt-right">
      <button
        type="button"
        className="btn btn-lg bg-danger"
        onClick={signOut}
      >
        Sair
      </button>
    </div>
    <MainTable />
  </section>
};

export default MainPage;
