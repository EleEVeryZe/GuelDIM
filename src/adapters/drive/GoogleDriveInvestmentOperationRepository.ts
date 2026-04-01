import { gapi } from "gapi-script";
import { InvestmentOperationRepository } from "../../domain/repositories/InvestmentOperationRepository";
import { InvestmentOperation } from "../../domain/entities/Investment";

export class GoogleDriveInvestmentOperationRepository implements InvestmentOperationRepository {
  async getAll(fileId: string): Promise<InvestmentOperation[]> {
    const response = await gapi.client.drive.files.get({
      fileId,
      alt: "media",
    });

    if (!response.body || response.body.length === 0) {
      return [];
    }

    try {
      return JSON.parse(response.body) as InvestmentOperation[];
    } catch (error) {
      console.error("Invalid JSON from Drive", error);
      return [];
    }
  }

  async add(fileId: string, operations: InvestmentOperation[]): Promise<void> {
    const existing = await this.getAll(fileId);
    const merged = [...existing, ...operations];
    await this.update(fileId, merged);
  }

  async update(fileId: string, operations: InvestmentOperation[]): Promise<void> {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: "PATCH",
      params: { uploadType: "media" },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(operations),
    });
  }

  async remove(fileId: string, operationId: string): Promise<void> {
    const existing = await this.getAll(fileId);
    const filtered = existing.filter((o) => o.id !== operationId);
    await this.update(fileId, filtered);
  }

  async createFile(name: string, initialContent: string): Promise<{ id: string }> {
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name,
      mimeType: "application/json",
    };

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      initialContent +
      closeDelimiter;

    const request = await gapi.client.request({
      path: "/upload/drive/v3/files",
      method: "POST",
      params: { uploadType: "multipart" },
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: multipartRequestBody,
    });

    return { id: request.result.id };
  }

  async listFiles(): Promise<Array<{ id?: string; name?: string }>> {
    const response = await gapi.client.drive.files.list({
      q: "name contains 'geldIn'",
      fields: "files(id, name)",
    });

    return response.result.files || [];
  }
}