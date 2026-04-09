import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Box, Button, Container, Typography, Paper } from '@mui/material';

const Apresentacao = ({ loadingAuth }: { loadingAuth: boolean }) => {
    const { signIn } = useContext(AuthContext);

    return (
        <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        GeldIn
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Controle financeiro inteligente na nuvem
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Transforme sua gestão financeira com uma planilha inteligente que vai além do Excel.
                        Acompanhe receitas, despesas e investimentos em tempo real, com relatórios visuais
                        e insights personalizados para tomar decisões mais acertadas.
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Seja você um profissional liberal, empresário ou estudante, o GeldIn se adapta
                        ao seu estilo de vida e ajuda você a alcançar seus objetivos financeiros.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={signIn}
                        title='Isso irá criar um arquivo financeiro.gueldin na sua pasta do Google Drive'
                        sx={{
                            backgroundColor: '#4285f4',
                            '&:hover': { backgroundColor: '#3367d6' },
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                        startIcon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="white" />
                            </svg>
                        }
                    >
                        {loadingAuth && "Aguarde..."}
                        {!loadingAuth && 'Usar Pelo Google Drive'}
                    </Button>
                </Box>

                <Box>
                    <Typography variant="body2" sx={{ color: '#e8f5e8', fontWeight: 'bold', opacity: 0.9 }}>
                        🔒 Seus dados ficam seguros no Google Drive - nós não armazenamos nada
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default Apresentacao;