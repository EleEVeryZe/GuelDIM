import React, { useContext, useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import MainPage from "../MainPage";
import Apresentacao from "../apresentacao/apresentacao";
import { RegistroContextProvider, RegistroProvider } from "../../context/RegistroContext";
import { AuthContext } from "../../context/AuthContext";

const LoginGueldim: React.FC = () => {
    const { loadingAuth, isSignedIn, signOut } = useContext(AuthContext);

    if (loadingAuth)
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
                    {
                        loadingAuth &&
                        "Verificando autenticação..."
                    }
                </Typography>
            </Box>
        );

    return (

        <RegistroContextProvider>
            <section>
                { isSignedIn ? <MainPage /> : <Apresentacao loadingAuth={loadingAuth} /> }
            </section>
        </RegistroContextProvider>
    );
};

export default LoginGueldim;