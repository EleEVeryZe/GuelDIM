import { GoogleDriveRegistroRepository } from "./GoogleDriveRegistroRepository";
import { gapi } from "gapi-script";

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

describe("GoogleDriveRegistroRepository - Unit Tests", () => {
    let repository: GoogleDriveRegistroRepository;

    beforeEach(() => {
        repository = new GoogleDriveRegistroRepository();
        jest.clearAllMocks();
        global.alert = jest.fn();
    });

    describe("getAll", () => {
        it("should return an empty array and alert when the request fails", async () => {
            (gapi.client.drive.files.get as jest.Mock).mockRejectedValue(new Error("Network Error"));

            const result = await repository.getAll("file-123");

            expect(result).toEqual([]);
            expect(global.alert).toHaveBeenCalledWith("Não foi possível obter arquivo");
        });

        it("should return parsed JSON data when body exists", async () => {
            const mockData = [{ id: "1", name: "Item 1" }];
            (gapi.client.drive.files.get as jest.Mock).mockResolvedValue({
                body: JSON.stringify(mockData),
            });

            const result = await repository.getAll("file-123");

            expect(result).toEqual(mockData);
        });
    });

    describe("update", () => {
        it("should replace an existing record with the same ID", async () => {
            const existingData = [
                { id: "1", name: "Old Name", dtCorrente: "", descricao: "", valor: 0, fonte: "", operacao: "", observacao: "", correcao: false, dataCriacao: "" },
                { id: "2", name: "Stay Same", dtCorrente: "", descricao: "", valor: 0, fonte: "", operacao: "", observacao: "", correcao: false, dataCriacao: "" }
            ];
            const updatedRecord = [{ id: "1", name: "New Name", dtCorrente: "", descricao: "", valor: 0, fonte: "", operacao: "", observacao: "", correcao: false, dataCriacao: "" }];

            jest.spyOn(repository, "getAll").mockResolvedValue(existingData);
            (gapi.client.request as jest.Mock).mockResolvedValue({});

            await repository.update("file-123", updatedRecord);

            expect(gapi.client.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "PATCH",
                    body: JSON.stringify([
                        { id: "2", name: "Stay Same", dtCorrente: "", descricao: "", valor: 0, fonte: "", operacao: "", observacao: "", correcao: false, dataCriacao: "" },
                        { id: "1", name: "New Name", dtCorrente: "", descricao: "", valor: 0, fonte: "", operacao: "", observacao: "", correcao: false, dataCriacao: "" }
                    ]),
                })
            );
        });
    });
});

describe("GoogleDriveRegistroRepository - add and remove", () => {
    let repository: GoogleDriveRegistroRepository;

    beforeEach(() => {
        repository = new GoogleDriveRegistroRepository();
        jest.clearAllMocks();
    });

    describe("add", () => {
        it("should append new records to existing ones and call PATCH", async () => {
            const fileId = "file-123";
            const existingData = [{ id: "1", name: "Existing" }];
            const newData = [{ id: "2", name: "New" }];

            jest.spyOn(repository, "getAll").mockResolvedValue(existingData);
            (gapi.client.request as jest.Mock).mockResolvedValue({});

            await repository.add(fileId, newData);

            expect(gapi.client.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    path: `/upload/drive/v3/files/${fileId}`,
                    method: "PATCH",
                    body: JSON.stringify([...existingData, ...newData]),
                })
            );
        });
    });

    describe("remove", () => {
        it("should remove the specific record by ID and call PATCH with the remaining list", async () => {
            const fileId = "file-123";
            const recordIdToRemove = "2";
            const existingData = [
                { id: "1", name: "Keep Me" },
                { id: "2", name: "Delete Me" },
                { id: "3", name: "Keep Me Too" }
            ];

            jest.spyOn(repository, "getAll").mockResolvedValue(existingData);
            (gapi.client.request as jest.Mock).mockResolvedValue({});

            await repository.remove(fileId, recordIdToRemove);

            const expectedData = [
                { id: "1", name: "Keep Me" },
                { id: "3", name: "Keep Me Too" }
            ];

            expect(gapi.client.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "PATCH",
                    body: JSON.stringify(expectedData),
                })
            );
        });

        it("should call PATCH with the same data if the ID to remove is not found", async () => {
            const existingData = [{ id: "1", name: "Item" }];
            jest.spyOn(repository, "getAll").mockResolvedValue(existingData);
            (gapi.client.request as jest.Mock).mockResolvedValue({});

            await repository.remove("file-123", "non-existent-id");

            expect(gapi.client.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: JSON.stringify(existingData),
                })
            );
        });
    });
});