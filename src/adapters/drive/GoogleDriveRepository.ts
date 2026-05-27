import { gapi } from "gapi-script";
import { ItemBaseRepository } from "../../application/outPort/RegistroRepository";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import 'dayjs/locale/pt-br'
import { IItemBase } from "@/interfaces/baseItem";

dayjs.extend(minMax);
dayjs.locale('pt-br');

export abstract class GoogleDriveRepository<T extends IItemBase> implements ItemBaseRepository<T> {
  static GOOGLEDRIVE_FILE_NAME = 'financeiro040520261.geldIn';
  fileId: string;
  private cachedRegistries: T[];
  private isCacheStale = false;

  constructor(fileId: string) {
    this.fileId = fileId
  }

  async updateAllIdComum(registros: T[]): Promise<void> {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${this.fileId}`,
      method: "PATCH",
      params: { uploadType: "media" },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registros),
    });
  }

  async getAll(): Promise<T[]> {
    if (!this.isCacheStale && this.cachedRegistries && this.cachedRegistries.length > 0) return this.cachedRegistries;

    try {
      const response = await gapi.client.drive.files.get({
        fileId: this.fileId,
        alt: "media",
      });

      if (!response.body || response.body.length === 0) {
        return [];
      }

      this.cachedRegistries = JSON.parse(response.body) as T[];
      this.isCacheStale = false;
      return this.cachedRegistries;
    } catch (error) {
      console.error("Error while retrieving data from Google Drive", error);
      alert("Não foi possível obter arquivo")
      return [];
    }
  }

  async add(registros: T[]): Promise<void> {
    const existing = await this.getAll();
    const merged = [...existing, ...registros];
    await gapi.client.request({
      path: `/upload/drive/v3/files/${this.fileId}`,
      method: "PATCH",
      params: { uploadType: "media" },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
    this.isCacheStale = true;
  }

  async update(registros: T[]): Promise<void> {
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
    this.cachedRegistries = merged;
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
    this.isCacheStale = true;
  }


  async getLastUpdate() {
    const regs = await this.getAll();

    if (!regs || regs.length === 0) {
      return null;
    }

    const latestRecord = regs.reduce((latest, current) => {
      if (!current.dtEfetiva) return latest;

      const currentDate = dayjs(current.dtEfetiva);

      if (!currentDate.isValid()) return latest;

      if (!latest) return current;

      const latestDate = dayjs(latest.dtEfetiva);

      if (currentDate.isAfter(latestDate)) {
        return current;
      }

      return latest;
    }, null);

    return latestRecord;
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

  public static async getFile(fileName?: string): Promise<{ id: string; name: string }> {
    const files = await GoogleDriveRepository.listFiles();

    const dataFile = files.find((file) => file.name === fileName);

    if (dataFile?.id)
      return { id: dataFile.id, name: fileName }

    const created = await GoogleDriveRepository.createFile(fileName, JSON.stringify([]));
    return { id: created.id, name: fileName }
  }
}
