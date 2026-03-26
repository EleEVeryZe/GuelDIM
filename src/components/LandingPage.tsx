import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div style={styles.container}>
      {/* HEADER / HERO SECTION */}
      <header style={styles.hero}>
        <nav style={styles.nav}>
          <span style={styles.logo}>GuelDIM <small style={{fontSize: '12px', opacity: 0.7}}>by Rodolfo Eliezer</small></span>
          <div style={styles.navLinks}>
            <a href="#experiencia" style={styles.navLink}>Experiência</a>
            <a href="#projetos" style={styles.navLink}>Projetos</a>
            <Link to="/app" style={styles.btnPrimary}>Acessar App</Link>
          </div>
        </nav>

        <div style={styles.heroContent}>
          <h1 style={styles.mainTitle}>Sistemas Robustos, <br/><span style={styles.highlight}>Código de Alta Performance.</span></h1>
          <p style={styles.subtitle}>
            Senior Java & Full Stack Developer especializado em Microserviços, Cloud e Arquiteturas de Baixo Nível. 
            Transformando complexidade em soluções escaláveis.
          </p>
          <div style={styles.socialBar}>
             <a href="https://github.com/EleEVeryZe" target="_blank" rel="noreferrer" style={styles.socialLink}>GitHub</a>
             <a href="https://www.linkedin.com/in/rodolfo-rezende-4742066b/" target="_blank" rel="noreferrer" style={styles.socialLink}>LinkedIn</a>
             <a href="mailto:rodolfoeliezer93@gmail.com" style={styles.socialLink}>Email</a>
          </div>
        </div>
      </header>

      {/* PROJETOS EM DESTAQUE */}
      <section id="projetos" style={styles.section}>
        <h2 style={styles.sectionTitle}>Projetos em Destaque</h2>
        <div style={styles.grid}>
          {/* Card Spkai */}
          <div style={styles.card}>
            <div style={styles.cardTag}>AI & Language</div>
            <h3>Spkai (Spikai)</h3>
            <p>Plataforma de aprendizado de idiomas com tutoria de IA em tempo real para correção de gramática e vocabulário.</p>
            <div style={styles.cardLinks}>
              <a href="https://spkai.forum" target="_blank" rel="noreferrer" style={styles.textLink}>Visitar Site →</a>
              <a href="https://github.com/EleEVeryZe/spikai" target="_blank" rel="noreferrer" style={styles.textLink}>Repositório</a>
            </div>
          </div>

          {/* Card GuelDIM */}
          <div style={styles.card}>
            <div style={styles.cardTag}>FinTech</div>
            <h3>GuelDIM</h3>
            <p>Gestão financeira baseada em Arquitetura Hexagonal com persistência serverless via Google Drive API.</p>
            <Link to="/app" style={styles.textLink}>Abrir Dashboard →</Link>
          </div>
        </div>
      </section>

      {/* EXPERIÊNCIA PROFISSIONAL EXTRAÍDA DO CV */}
      <section id="experiencia" style={{...styles.section, backgroundColor: '#f8f9fa'}}>
        <h2 style={styles.sectionTitle}>Trajetória Profissional</h2>
        <div style={styles.timeline}>
          <div style={styles.timelineItem}>
            <h4>Act Consultoria em Tecnologia — Senior Java</h4>
            <span style={styles.date}>2024 - 2025</span>
            <p>Liderança no desenvolvimento de microserviços escaláveis com Spring Boot e comunicação assíncrona via Apache Kafka[cite: 81, 84, 85].</p>
          </div>

          <div style={styles.timelineItem}>
            <h4>NTT Data — Programador Full Stack</h4>
            <span style={styles.date}>2022 - 2024</span>
            <p>Desenvolvimento em larga escala com React.js e Java Spring, utilizando Terraform para Infraestrutura como Código (IaC)[cite: 88, 91, 93].</p>
          </div>

          <div style={styles.timelineItem}>
            <h4>Vetta & Actio Brasil — Programador</h4>
            <span style={styles.date}>2020 - 2022</span>
            <p>Implementação de soluções críticas em .NET Core e ReactJS com foco em gerenciamento de risco e Docker/Kubernetes[cite: 105, 109, 112].</p>
          </div>
        </div>
      </section>

      {/* SKILLS TÉCNICAS */}
      <section style={styles.section}>
        <div style={styles.skillsContainer}>
          <div style={styles.skillCategory}>
            <h3 style={styles.skillTitle}>Backend & Infra</h3>
            <p>Java (Spring Boot), Node.js, C#, Kafka, Docker, Kubernetes, Terraform[cite: 84, 85, 93, 95].</p>
          </div>
          <div style={styles.skillCategory}>
            <h3 style={styles.skillTitle}>Frontend & Mobile</h3>
            <p>React.js, Angular, TypeScript, Android Studio (Java)[cite: 86, 91, 97].</p>
          </div>
          <div style={styles.skillCategory}>
            <h3 style={styles.skillTitle}>Database</h3>
            <p>PostgreSQL, SQL Server, MongoDB[cite: 87, 92].</p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>© 2026 Rodolfo Eliezer — Bacharel em Sistemas de Informação (PUC Minas) [cite: 145]</p>
        <div style={styles.footerDownloads}>
          <a href="/curriculo-pt.pdf" style={styles.downloadLink}>CV Português (PDF)</a>
          <a href="/curriculo-en.pdf" style={styles.downloadLink}>CV English (PDF)</a>
        </div>
      </footer>
    </div>
  );
};

// ESTILOS (Simulando um design moderno e limpo)
const styles: { [key: string]: React.CSSProperties } = {
  container: { backgroundColor: "#fff", color: "#333", lineHeight: "1.6" },
  hero: { padding: "40px 80px", backgroundColor: "#1a1a1a", color: "#fff", minHeight: "60vh", display: "flex", flexDirection: "column" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "60px" },
  logo: { fontSize: "24px", fontWeight: "bold", letterSpacing: "1px" },
  navLinks: { display: "flex", gap: "25px", alignItems: "center" },
  navLink: { color: "#fff", textDecoration: "none", fontWeight: 500 },
  btnPrimary: { backgroundColor: "#007bff", color: "#fff", padding: "10px 22px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" },
  heroContent: { maxWidth: "800px", marginTop: "40px" },
  mainTitle: { fontSize: "52px", marginBottom: "20px", fontWeight: 800 },
  highlight: { color: "#007bff" },
  subtitle: { fontSize: "20px", opacity: 0.9, marginBottom: "30px" },
  socialBar: { display: "flex", gap: "20px" },
  socialLink: { color: "#007bff", fontWeight: "bold", textDecoration: "none" },
  section: { padding: "80px 80px" },
  sectionTitle: { fontSize: "32px", marginBottom: "40px", borderLeft: "5px solid #007bff", paddingLeft: "15px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" },
  card: { padding: "30px", border: "1px solid #eee", borderRadius: "12px", transition: "0.3s" },
  cardTag: { fontSize: "12px", fontWeight: "bold", color: "#007bff", textTransform: "uppercase", marginBottom: "10px" },
  cardLinks: { marginTop: "15px", display: "flex", gap: "15px" },
  textLink: { color: "#007bff", fontWeight: "bold", textDecoration: "none" },
  timeline: { borderLeft: "2px solid #ddd", paddingLeft: "30px" },
  timelineItem: { marginBottom: "40px", position: "relative" },
  date: { fontSize: "14px", color: "#666", display: "block", marginBottom: "5px" },
  skillsContainer: { display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "space-between" },
  skillCategory: { flex: "1", minWidth: "200px" },
  skillTitle: { color: "#1a1a1a", marginBottom: "10px" },
  footer: { padding: "40px 80px", backgroundColor: "#1a1a1a", color: "#ccc", textAlign: "center" },
  footerDownloads: { marginTop: "20px", display: "flex", justifyContent: "center", gap: "30px" },
  downloadLink: { color: "#fff", textDecoration: "underline" },
};

export default LandingPage;