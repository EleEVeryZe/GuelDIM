import { gapi } from "gapi-script";
import { RegistroRepository } from "../../domain/repositories/RegistroRepository";
import { Registro } from "../../domain/entities/Registro";

export class GoogleDriveRegistroRepository implements RegistroRepository {
  async getAll(fileId: string): Promise<Registro[]> {
    const response = await gapi.client.drive.files.get({
      fileId,
      alt: "media",
    });

    if (!response.body || response.body.length === 0) {
      return [];
    }

    try {
      return JSON.parse(response.body) as Registro[];
    } catch (error) {
      console.error("Invalid JSON from Drive", error);
      return [];
    }
  }

  async add(fileId: string, registros: Registro[]): Promise<void> {
    const existing = await this.getAll(fileId);
    const merged = [...existing, ...registros];
    await this.update(fileId, merged);
  }

  async update(fileId: string, registros: Registro[]): Promise<void> {
    const existing = await this.getAll(fileId);
    const filtered = existing.filter(reg => reg.id != registros.at(0).id);
    const merged = [...filtered, ...registros];
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: "PATCH",
      params: { uploadType: "media" },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
  }

  async remove(fileId: string, registroId: string): Promise<void> {
    const existing = await this.getAll(fileId);
    const filtered = existing.filter((r) => r.id !== registroId);
    await this.update(fileId, filtered);
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
