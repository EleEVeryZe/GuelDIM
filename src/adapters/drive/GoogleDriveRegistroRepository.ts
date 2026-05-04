import { gapi } from "gapi-script";
import { RegistroRepository } from "../../domain/repositories/RegistroRepository";
import { Registro } from "../../domain/entities/Registro";
import dayjs from "dayjs";

export class GoogleDriveRegistroRepository implements RegistroRepository {
  fileId: string;

  constructor(fileId: string) {
    this.fileId = fileId
  }

  async updateAllIdComum(idCommon: string, newValue: Pick<Registro, "descricao" | "valor" | "ehPago">) {
    const existing = await this.getAll();

    const updatedRegistries = existing.map(oldVlr => {
      if (oldVlr.idComum == idCommon && dayjs(oldVlr.dtCorrente).isAfter(dayjs().startOf('month')))
        return { ...oldVlr, ...newValue };
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
    await this.update(filtered);
  }

  async createFile(name: string, initialContent: string): Promise<{ id: string }> {
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

  async listFiles(): Promise<Array<{ id?: string; name?: string }>> {
    const response = await gapi.client.drive.files.list({
      pageSize: 100,
      fields: "files(id, name, mimeType)",
    });

    const files = response.result.files;
    if (!files) return [];

    return files.map((file) => ({ id: file.id, name: file.name }));
  }
}
