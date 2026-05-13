import React, { useContext } from 'react';
import { Box, CircularProgress, Typography, Button, Toolbar, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import { useRegistro } from '@/context/RegistroContext';
import { AuthContext } from '@/context/AuthContext';
import MainTable from './mainTable/MainTable';
const MainPage: React.FC = () => {
  const { isLoadingFile } = useRegistro();
  const { signOut } = useContext(AuthContext);

  if (isLoadingFile) {
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
  }

  return (
    <Box component="section" sx={{ width: '100%', py: 2 }}>
      <Toolbar 
        variant="dense" 
        disableGutters 
        sx={{ 
          justifyContent: 'space-between', 
          minHeight: '1px'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={Link}
            to="/cotacao"
            variant="contained" 
            color="primary"
            size="small"
            startIcon={<RequestPageIcon />}
          >
            Cotações
          </Button>
        </Box>

        <Button
          variant="outlined" 
          color="error"
          size="small"
          onClick={signOut}
          startIcon={<LogoutIcon />}
        >
          Sair
        </Button>
      </Toolbar>
      
      <Divider sx={{ mb: 1 }} /> 

      <MainTable />
    </Box>
  );
};

export default MainPage;
