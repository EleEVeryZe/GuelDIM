import { Registro } from "../interfaces/interfaces";

export const registrosMock = 
[
    {
        "id": "584027de-b600-4f5f-83ed-55782ec83c8c",
        "dtCorrente": "2025-04-25T01:03:51.165Z",
        "descricao": "Financiamento casa",
        "valor": 30,
        "fonte": "DEBITO",
        "categoria": "",
        "qtdParc": 10,
        "comentario": "",
        "idComum": "9f529bff-9856-4c76-8364-c6084a5d8d54"
    },
    {
        "id": "584027de-b600-4f5f-83ed-55782ec83c8c",
        "dtCorrente": "2025-05-25T01:03:51.165Z",
        "descricao": "Financiamento casa",
        "valor": 30,
        "fonte": "DEBITO",
        "categoria": "1",
        "qtdParc": 10,
        "comentario": "",
        "idComum": "9f529bff-9856-4c76-8364-c6084a5d8d54"
    },
    {
        "id": "c8b47bb0-5ab9-43ee-8a19-817bbe25daf0",
        "dtCorrente": "2025-06-25T01:03:51.165Z",
        "descricao": "Financiamento casa",
        "valor": 1500,
        "fonte": "DEBITO",
        "categoria": "",
        "qtdParc": 10,
        "comentario": "",
        "idComum": "9f529bff-9856-4c76-8364-c6084a5d8d54"
    },
    {
        "id": "3fd69481-842d-4bfa-a119-967af9e8a1d3",
        "dtCorrente": "2025-07-25T01:03:51.165Z",
        "descricao": "Financiamento casa",
        "valor": 1889,
        "fonte": "DEBITO",
        "categoria": "",
        "qtdParc": 10,
        "comentario": "",
        "idComum": "9f529bff-9856-4c76-8364-c6084a5d8d54"
    }
] as unknown as Registro[];

export const groupedByDateMock = {
  "202505": [
    {
      id: "584027de-b600-4f5f-83ed-55782ec83c8c",
      dtCorrente: "2025-05-25T01:03:51.165Z",
      descricao: "Financiamento casa",
      valor: 30,
      fonte: "DEBITO",
      categoria: "",
      qtdParc: 10,
      comentario: "",
      idComum: "9f529bff-9856-4c76-8364-c6084a5d8d54",
    },
    {
      id: "584027de-b600-4f5f-83ed-55782ec83c8c",
      dtCorrente: "2025-05-25T01:03:51.165Z",
      descricao: "Financiamento casa",
      valor: 30,
      fonte: "DEBITO",
      categoria: "1",
      qtdParc: 10,
      comentario: "",
      idComum: "9f529bff-9856-4c76-8364-c6084a5d8d54",
    },
  ],
  "202506": [
    {
      id: "c8b47bb0-5ab9-43ee-8a19-817bbe25daf0",
      dtCorrente: "2025-06-25T01:03:51.165Z",
      descricao: "Financiamento casa",
      valor: 1500,
      fonte: "DEBITO",
      categoria: "",
      qtdParc: 10,
      comentario: "",
      idComum: "9f529bff-9856-4c76-8364-c6084a5d8d54",
    },
  ],
  "202507": [
    {
      id: "3fd69481-842d-4bfa-a119-967af9e8a1d3",
      dtCorrente: "2025-07-25T01:03:51.165Z",
      descricao: "Financiamento casa",
      valor: 1889,
      fonte: "DEBITO",
      categoria: "",
      qtdParc: 10,
      comentario: "",
      idComum: "9f529bff-9856-4c76-8364-c6084a5d8d54",
    },
  ],
} as unknown as { [key: string]: Registro[] }; 