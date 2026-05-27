import { GoogleDriveRegistroRepository } from "./GoogleDriveRegistroRepository";
import { gapi } from "gapi-script";
import dayjs from "dayjs";
import { Registro } from "../../domain/entities/Registro";

const fileId = "file-123";

jest.mock("gapi-script", () => ({
  gapi: {
    client: {
      drive: {
        files: {
          get: jest.fn(),
          list: jest.fn(),
        },
      },
      request: jest.fn(),
    },
  },
}));

const makeRegistro = (
  id: string,
  overrides: Omit<Partial<Registro>, "dtCorrente"> & { dtCorrente?: string | ReturnType<typeof dayjs> } = {}
): Registro => ({
  id,
  dtCorrente: overrides.dtCorrente ?? dayjs(),
  descricao: "",
  valor: 0,
  fonte: "",
  categoria: null,
  qtdParc: 1,
  parcelaAtual: 1,
  comentario: "",
  ehPago: false,
  ...overrides,
} as Registro);

const serializeRegistro = (registro: Registro): Record<string, unknown> => ({
  ...registro,
  dtCorrente: typeof registro.dtCorrente === "object" ? registro.dtCorrente.toJSON() : registro.dtCorrente,
});

describe("GoogleDriveRegistroRepository", () => {
  let repository: GoogleDriveRegistroRepository;

  beforeEach(() => {
    repository = new GoogleDriveRegistroRepository(fileId);
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  describe("getAll", () => {
    it("returns parsed JSON when the Drive file body exists", async () => {
      const expected = [
        makeRegistro("1", {
          descricao: "Item 1",
          dtCorrente: dayjs().toJSON(),
        }),
      ];
      (gapi.client.drive.files.get as jest.Mock).mockResolvedValue({ body: JSON.stringify(expected) });

      const result = await repository.getAll();

      expect(result).toEqual(expected);
      expect(gapi.client.drive.files.get).toHaveBeenCalledWith({ fileId, alt: "media" });
    });

    it("returns an empty array and alerts when the Drive request fails", async () => {
      (gapi.client.drive.files.get as jest.Mock).mockRejectedValue(new Error("Network Error"));

      const result = await repository.getAll();

      expect(result).toEqual([]);
      expect(global.alert).toHaveBeenCalledWith("Não foi possível obter arquivo");
    });
  });

  describe("add", () => {
    it("appends new registros to existing ones and sends a PATCH request", async () => {
      const existing = [makeRegistro("1", { descricao: "Existing" })];
      const additions = [makeRegistro("2", { descricao: "New" })];
      jest.spyOn(repository, "getAll").mockResolvedValue(existing);
      (gapi.client.request as jest.Mock).mockResolvedValue({});

      await repository.add(additions);

      expect(gapi.client.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: `/upload/drive/v3/files/${fileId}`,
          method: "PATCH",
          params: { uploadType: "media" },
          headers: { "Content-Type": "application/json" },
        })
      );

      const requestBody = JSON.parse((gapi.client.request as jest.Mock).mock.calls[0][0].body);
      expect(requestBody).toEqual(
        [...existing, ...additions].map(serializeRegistro)
      );
    });
  });

  describe("update", () => {
    it("replaces the existing registro with the same id and keeps other records", async () => {
      const existing = [
        makeRegistro("1", { descricao: "Old Name" }),
        makeRegistro("2", { descricao: "Keep" }),
      ];
      const updated = [makeRegistro("1", { descricao: "New Name" })];
      jest.spyOn(repository, "getAll").mockResolvedValue(existing);
      (gapi.client.request as jest.Mock).mockResolvedValue({});

      await repository.update(updated);

      const requestBody = JSON.parse((gapi.client.request as jest.Mock).mock.calls[0][0].body);
      expect(requestBody).toEqual(
        [existing[1], updated[0]].map(serializeRegistro)
      );
    });
  });

  describe("remove", () => {
    it("filters out the registro with the given id and updates the Drive file", async () => {
      const existing = [makeRegistro("1", { descricao: "keep" }), makeRegistro("2", { descricao: "delete" })];
      jest.spyOn(repository, "getAll").mockResolvedValue(existing);
      (gapi.client.request as jest.Mock).mockResolvedValue({});

      await repository.remove("2");

      const requestBody = JSON.parse((gapi.client.request as jest.Mock).mock.calls[0][0].body);
      expect(requestBody).toEqual([serializeRegistro(existing[0])]);
    });
  });

  describe("updateAllIdComum", () => {
    it("updates only registros with the same idComum and current-month dtCorrente", async () => {
      const commonId = "common-1";
      const currentMonthMatch = makeRegistro("1", {
        idComum: commonId,
        dtCorrente: dayjs().startOf("month").add(1, "day"),
        descricao: "old",
        valor: 100,
        ehPago: false,
        categoria: "old-cat",
      });
      const previousMonthMatch = makeRegistro("2", {
        idComum: commonId,
        dtCorrente: dayjs().subtract(1, "month"),
        descricao: "old",
        valor: 50,
        ehPago: false,
        categoria: "old-cat",
      });
      const otherRegistro = makeRegistro("3", { idComum: "other", descricao: "keep" });

      jest.spyOn(repository, "getAll").mockResolvedValue([currentMonthMatch, previousMonthMatch, otherRegistro]);
      (gapi.client.request as jest.Mock).mockResolvedValue({});

      const updatedRegistries = [
        { ...currentMonthMatch, descricao: "updated", valor: 200, ehPago: true, categoria: "new-cat" },
        previousMonthMatch,
        otherRegistro,
      ];

      await repository.updateAllIdComum(updatedRegistries);

      const requestBody = JSON.parse((gapi.client.request as jest.Mock).mock.calls[0][0].body);
      expect(requestBody).toEqual(updatedRegistries.map(serializeRegistro));
    });
  });
});
