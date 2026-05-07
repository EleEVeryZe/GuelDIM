import { gapi } from "gapi-script";
import { RegistroRepository } from "../../domain/repositories/RegistroRepository";
import { Registro } from "../../domain/entities/Registro";
import dayjs from "dayjs";
import data from './../../../public/data.json';

export class GoogleDriveRegistroRepository implements RegistroRepository {
  static GOOGLEDRIVE_FILE_NAME = 'financeiro040520261.geldIn'; 
  fileId: string;

  constructor(fileId: string) {
    this.fileId = fileId
  }

  async updateAllIdComum(idCommon: string, newValue: Registro) {
    const existing = await this.getAll();

    const updatedRegistries = existing.map(oldVlr => {
      if (oldVlr.idComum == idCommon && dayjs(oldVlr.dtCorrente).isAfter(dayjs().startOf('month'))) {
        const { descricao, valor, ehPago, categoria } = newValue;
        return { ...oldVlr, descricao, valor, ehPago, categoria };
      }
      return oldVlr;
    });

    return gapi.client.request({
      path: `/upload/drive/v3/files/${this.fileId}`,
      method: "PATCH",
      params: { uploadType: "media" },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedRegistries),
    });
  }

  async getAll(): Promise<Registro[]> {
    try {
      const response = await gapi.client.drive.files.get({
        fileId: this.fileId,
        alt: "media",
      });

      if (!response.body || response.body.length === 0) {
        return [];
      }

      return JSON.parse(response.body) as Registro[];
    } catch (error) {
      console.error("Error while retrieving data from Google Drive", error);
      alert("Não foi possível obter arquivo")
      return [];
    }
  }

  async add(registros: Registro[]): Promise<void> {
    const existing = await this.getAll();
    const merged = [...existing, ...registros];
    await gapi.client.request({
      path: `/upload/drive/v3/files/${this.fileId}`,
      method: "PATCH",
      params: { uploadType: "media" },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
  }

  async update(registros: Registro[]): Promise<void> {
    const existing = await this.getAll();
    const filtered = existing.filter(reg => reg.id != registros.at(0).id);
    const merged = [...filtered, ...registros];
    await gapi.client.request({
      path: `/upload/drive/v3/files/${this.fileId}`,
      method: "PATCH",
      params: { uploadType: "media" },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
  }

  async remove(registroId: string): Promise<void> {
    const existing = await this.getAll();
    const filtered = existing.filter((r) => r.id !== registroId);
    await gapi.client.request({
      path: `/upload/drive/v3/files/${this.fileId}`,
      method: "PATCH",
      params: { uploadType: "media" },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filtered),
    });
  }

  public static async createFile(name: string, initialContent: string): Promise<{ id: string }> {
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const content =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify({ name, mimeType: "application/json" }) +
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      initialContent +
      closeDelimiter;

    const response = await gapi.client.request({
      path: "/upload/drive/v3/files",
      method: "POST",
      params: { uploadType: "multipart" },
      headers: { "Content-Type": `multipart/related; boundary="${boundary}"` },
      body: content,
    });

    if (!response?.result?.id) {
      throw new Error("Failed to create data file on Google Drive");
    }

    return { id: String(response.result.id) };
  }

  public static async listFiles(): Promise<Array<{ id?: string; name?: string }>> {
    const response = await gapi.client.drive.files.list({
      pageSize: 100,
      fields: "files(id, name, mimeType)",
    });

    const files = response.result.files;
    if (!files) return [];

    return files.map((file) => ({ id: file.id, name: file.name }));
  }

  public static async getInstance(): Promise<GoogleDriveRegistroRepository> {
    const files = await GoogleDriveRegistroRepository.listFiles();

    const dataFile = files.find((file) => file.name === GoogleDriveRegistroRepository.GOOGLEDRIVE_FILE_NAME);

    if (dataFile?.id)
      return new GoogleDriveRegistroRepository(dataFile.id)


    const created = await GoogleDriveRegistroRepository.createFile(GoogleDriveRegistroRepository.GOOGLEDRIVE_FILE_NAME, JSON.stringify(data));
    return new GoogleDriveRegistroRepository(created.id)
  }
}
