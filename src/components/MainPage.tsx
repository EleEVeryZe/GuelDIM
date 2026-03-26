// src/components/MainPage.tsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRegistro } from "../context/RegistroContext";
import Apresentacao from "./apresentacao/apresentacao";
import MainTable from "./mainTable/MainTable";
const MainPage: React.FC = () => {
  const { isSignedIn, signIn, signOut } = useContext(AuthContext);
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

  if (loading) return "Obtendo arquivo...";

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
        <Apresentacao />
      )}
    </section>
  );
};

export default MainPage;
