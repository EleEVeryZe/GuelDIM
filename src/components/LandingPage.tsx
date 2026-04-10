import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import LaunchIcon from "@mui/icons-material/Launch";

const LandingPage: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: "background.default", color: "text.primary" }}>
      <Box
        component="section"
        sx={{
          background: "linear-gradient(135deg, #0d47a1 0%, #1e88e5 100%)",
          color: "common.white",
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: { xs: 4, md: 8 } }}>
            <Stack direction="row" alignItems="right" spacing={2}>
              <Link href="#experiencia" underline="hover" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                Experiência
              </Link>
              <Link href="#projetos" underline="hover" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                Projetos
              </Link>
            </Stack>
          </Box>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, lineHeight: 1.05, mb: 3 }}>
                Sistemas robustos com
                <Box component="span" sx={{ display: "block", color: "secondary.light" }}>
                  código de qualidade 
                </Box>
              </Typography>
              <Typography variant="h6" sx={{ maxWidth: 620, mb: 4, opacity: 0.92 }}>
                Senior Java & Full Stack Developer especializado em microserviços, cloud e arquiteturas de baixo nível.
                Transformando complexidade em soluções escaláveis para equipes e produtos de alto impacto.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button component={RouterLink} to="/app" variant="contained" size="large">
                  Entrar no App
                </Button>
                <Button component="a" href="mailto:rodolfoeliezer93@gmail.com" variant="outlined" size="large" sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.7)" }}>
                  Contato
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 4, flexWrap: "wrap" }}>
                <Link href="https://github.com/EleEVeryZe" target="_blank" rel="noreferrer" color="inherit" underline="none">
                  <Button startIcon={<GitHubIcon />} sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.25)", border: 1 }}>GitHub</Button>
                </Link>
                <Link href="https://www.linkedin.com/in/rodolfo-rezende-4742066b/" target="_blank" rel="noreferrer" color="inherit" underline="none">
                  <Button startIcon={<LinkedInIcon />} sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.25)", border: 1 }}>LinkedIn</Button>
                </Link>
                <Link href="mailto:rodolfoeliezer93@gmail.com" color="inherit" underline="none">
                  <Button startIcon={<EmailIcon />} sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.25)", border: 1 }}>Email</Button>
                </Link>
              </Stack>
            </Grid>

          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box id="experiencia" sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, position: "relative", pl: 2 }}>
            Trajetória Profissional
          </Typography>
          <Divider sx={{ width: 80, borderBottomWidth: 3, mb: 4, bgcolor: "secondary.main" }} />

          <Stack spacing={3}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
                2024 - 2025
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Act Consultoria em Tecnologia — Senior Java
              </Typography>
              <Typography color="text.secondary">
                Liderança no desenvolvimento de microserviços escaláveis com Spring Boot e comunicação assíncrona via Apache Kafka.
              </Typography>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
                2022 - 2024
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                NTT Data — Programador Full Stack
              </Typography>
              <Typography color="text.secondary">
                Desenvolvimento em larga escala com React.js e Java Spring, utilizando Terraform para Infraestrutura como Código.
              </Typography>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
                2020 - 2022
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Vetta & Actio Brasil — Programador
              </Typography>
              <Typography color="text.secondary">
                Implementação de soluções críticas em .NET Core e ReactJS com foco em gerenciamento de risco e Docker/Kubernetes.
              </Typography>
            </Paper>
          </Stack>
        </Box>

        <Box id="projetos" sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, position: "relative", pl: 2 }}>
            Projetos em Destaque
          </Typography>
          <Divider sx={{ width: 80, borderBottomWidth: 3, mb: 4, bgcolor: "secondary.main" }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: "100%" }}>
                <Typography variant="overline" sx={{ color: "secondary.main", mb: 2, display: "block", letterSpacing: 1.3 }}>
                  AI & Language
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Spkai (Spikai)
                </Typography>
                <Typography sx={{ mb: 3, color: "text.secondary" }}>
                  Plataforma de aprendizado de idiomas com tutoria de IA em tempo real para correção de gramática e vocabulário.
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button href="https://spkai.forum" target="_blank" rel="noreferrer" endIcon={<LaunchIcon />}>
                    Visitar Site
                  </Button>
                  <Button href="https://github.com/EleEVeryZe/spikai" target="_blank" rel="noreferrer">
                    Repositório
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: "100%" }}>
                <Typography variant="overline" sx={{ color: "secondary.main", mb: 2, display: "block", letterSpacing: 1.3 }}>
                  FinTech
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  GuelDIM
                </Typography>
                <Typography sx={{ mb: 3, color: "text.secondary" }}>
                  Gestão financeira baseada em Arquitetura Hexagonal com persistência serverless via Google Drive API.
                </Typography>
                <Button component={RouterLink} to="/app" variant="contained" endIcon={<LaunchIcon />}>
                  Abrir Dashboard
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mb: 6, paddingTop: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, position: "relative", pl: 2 }}>
            Competências Técnicas
          </Typography>
          <Divider sx={{ width: 80, borderBottomWidth: 3, mb: 4, bgcolor: "secondary.main" }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Backend & Infra
                </Typography>
                <Typography color="text.secondary">
                  Java (Spring Boot), Node.js, C#, Kafka, Docker, Kubernetes, Terraform.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Frontend & Mobile
                </Typography>
                <Typography color="text.secondary">
                  React.js, Angular, TypeScript, Android Studio (Java).
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Database
                </Typography>
                <Typography color="text.secondary">
                  PostgreSQL, SQL Server, MongoDB.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Box component="footer" sx={{ bgcolor: "grey.900", color: "grey.300", py: 5 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="body2">
              © 2026 Rodolfo Eliezer — Bacharel em Sistemas de Informação (PUC Minas)
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="/curriculo-pt.pdf" underline="hover" color="inherit">
                CV Português (PDF)
              </Link>
              <Link href="/curriculo-en.pdf" underline="hover" color="inherit">
                CV English (PDF)
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
