// src/components/MainPage.tsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRegistro } from "../context/RegistroContext";
import Apresentacao from "./apresentacao/apresentacao";
import MainTable from "./mainTable/MainTable";
import { Box, CircularProgress, Typography } from "@mui/material";

const MainPage: React.FC = () => {
  const { loadingAuth, isSignedIn, signIn, signOut } = useContext(AuthContext);
  const { useCase } = useRegistro();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileId, setFileId] = useState<string>();

  useEffect(() => {
    if (isSignedIn) fetchFiles();
  }, [isSignedIn]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const currentFileId = await useCase.createOrOpenDataFile();
      setFileId(currentFileId);
    } catch (error) {
      console.error("Error fetching or creating file:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
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
          Obtendo arquivo
        </Typography>
      </Box>
    );

  return (
    <section>
      {isSignedIn ? (
        <section>
          <div className="mb-4 txt-right">
            <button
              type="button"
              className="btn btn-lg bg-danger"
              onClick={signOut}
            >
              Sair
            </button>
          </div>
          {fileId && <MainTable fileId={fileId} />}
        </section>
      ) : (
        <Apresentacao loadingAuth={loadingAuth}/>
      )}
    </section>
  );
};

export default MainPage;
