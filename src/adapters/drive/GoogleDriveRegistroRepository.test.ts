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

describe("GoogleDriveRegistroRepository", () => {
    let repository: GoogleDriveRegistroRepository;
    const mockFileId = "test-file-123";

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new GoogleDriveRegistroRepository(mockFileId);
        jest.spyOn(console, "error").mockImplementation(() => { });
        global.alert = jest.fn();
    });

    describe("updateAllIdComum()", () => {
        it("Should update all fields with the same idComum and date be higher than current time", async () => {
            const mockData = [
                { id: "1", descricao: "Test", idComum: "idcomum", valor: 11, ehPago: true, dtCorrente: "2025-06-11T20:37:48.836Z" },
                { id: "2", descricao: "Test1", idComum: "idcomum", valor: 11, ehPago: true, dtCorrente: "2026-10-11T20:37:48.836Z" },
                { id: "3", descricao: "Test2", idComum: "idNaoComum", valor: 11, ehPago: true, dtCorrente: "2025-06-11T20:37:48.836Z" },
            ];

            (gapi.client.drive.files.get as jest.Mock).mockResolvedValue({
                body: JSON.stringify(mockData),
            });

            await repository.updateAllIdComum("idcomum", {
                descricao: "Nova Descricao",
                valor: 123,
                ehPago: false,
            });
        })
    })

    describe("getAll()", () => {
        it("should return an empty array if the file body is empty", async () => {
            (gapi.client.drive.files.get as jest.Mock).mockResolvedValue({
                body: "",
            });

            const result = await repository.getAll();
            expect(result).toEqual([]);
        });

        it("should return parsed JSON data when successful", async () => {
            const mockData = [{ id: "1", name: "Test" }];
            (gapi.client.drive.files.get as jest.Mock).mockResolvedValue({
                body: JSON.stringify(mockData),
            });

            const result = await repository.getAll();
            expect(result).toEqual(mockData);
            expect(gapi.client.drive.files.get).toHaveBeenCalledWith({
                fileId: mockFileId,
                alt: "media",
            });
        });

        it("should return empty array and alert on error", async () => {
            (gapi.client.drive.files.get as jest.Mock).mockRejectedValue(new Error("API Error"));

            const result = await repository.getAll();
            expect(result).toEqual([]);
            expect(global.alert).toHaveBeenCalledWith("Não foi possível obter arquivo");
        });
    });

    describe("add()", () => {
        it("should merge new records with existing ones and call PATCH", async () => {
            const existingData = [{ id: "1", value: "old" }];
            const newData = [{ id: "2", value: "new" }];

            (gapi.client.drive.files.get as jest.Mock).mockResolvedValue({
                body: JSON.stringify(existingData),
            });

            await repository.add(newData);

            expect(gapi.client.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "PATCH",
                    path: `/upload/drive/v3/files/${mockFileId}`,
                    body: JSON.stringify([...existingData, ...newData]),
                })
            );
        });
    });

    describe("remove()", () => {
        it("should filter out the specified ID and update the file", async () => {
            const existingData = [
                { id: "1", value: "keep" },
                { id: "2", value: "delete" },
            ];

            (gapi.client.drive.files.get as jest.Mock).mockResolvedValue({
                body: JSON.stringify(existingData),
            });

            await repository.remove("2");

            expect(gapi.client.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: JSON.stringify([{ id: "1", value: "keep" }]),
                })
            );
        });
    });

    describe("createFile()", () => {
        it("should send a multipart request and return the new ID", async () => {
            const mockResponse = { result: { id: "new-file-id" } };
            (gapi.client.request as jest.Mock).mockResolvedValue(mockResponse);

            const result = await repository.createFile("my-db.json", "[]");

            expect(result.id).toBe("new-file-id");
            expect(gapi.client.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "POST",
                    path: "/upload/drive/v3/files",
                })
            );
        });

        it("should throw error if response has no ID", async () => {
            (gapi.client.request as jest.Mock).mockResolvedValue({});
            await expect(repository.createFile("x", "[]")).rejects.toThrow();
        });
    });
});