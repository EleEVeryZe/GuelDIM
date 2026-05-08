import { RegistroRepository } from "../../application/outPort/RegistroRepository";
import { Registro } from "../../domain/entities/Registro";
import localData from './../../../public/data.json';

export class LocalRegistroRepository implements RegistroRepository {
    static fileIdVlr = "file-01";
    private static instance: LocalRegistroRepository;
    data: Registro[];
    fileId: string;

    private constructor() {
        this.fileId = LocalRegistroRepository.fileIdVlr;
        this.data = localData as unknown as Registro[];
    }

    public static getInstance(): LocalRegistroRepository {
        if (!LocalRegistroRepository.instance) {
            LocalRegistroRepository.instance = new LocalRegistroRepository();
        }
        return LocalRegistroRepository.instance;
    }

    async getAll(): Promise<Registro[]> {
        return await Promise.resolve(this.data);
    }

    async add(registros: Registro[]): Promise<void> {
        let existing = await this.getAll();
        existing = [...existing, ...registros];
    }

    async update(registros: Registro[]): Promise<void> {
        let existing = await this.getAll();
        const filtered = existing.filter(reg => reg.id != registros.at(0).id);
        existing = [...filtered, ...registros];
    }

    async remove(registroId: string): Promise<void> {
        const existing = await this.getAll();
        const filtered = existing.filter((r) => r.id !== registroId);
        await this.update(filtered);
    }

    async createFile(name: string, initialContent: string): Promise<{ id: string }> {
        return { id: this.fileId };
    }

    public static async listFiles(): Promise<Array<{ id?: string; name?: string }>> {
        return [{ id: "", name: LocalRegistroRepository.fileIdVlr }];
    }

    async updateAllIdComum(registros: Registro[]): Promise<void> {
        this.data = registros;
    }
}
