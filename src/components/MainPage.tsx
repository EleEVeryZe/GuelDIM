// src/components/MainPage.tsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { createFile, listFiles } from "../services/googleApi";
import Apresentacao from "./apresentacao/apresentacao";
import MainTable from "./mainTable/MainTable";
const MainPage: React.FC = () => {
  const { isSignedIn, signIn, signOut } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileId, setFileId] = useState<string>();

  useEffect(() => {
    if (isSignedIn) fetchFiles();
  }, [isSignedIn]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let currentFileId;
      const apiFiles = await listFiles();
      currentFileId = apiFiles
        .filter(({ name }) => name === "financeiro.geldIn")
        .map(({ id }) => id)
        .pop();
      if (!currentFileId) {
        const fileCreated = (await createFile(
          `financeiro1.geldIn`,
          "[]"
        )) as unknown as { body: string };
        currentFileId = JSON.parse(fileCreated.body).id;
      }
      setFileId(currentFileId);
    } catch (error) {
      console.error("Error fetching files:", error);
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
