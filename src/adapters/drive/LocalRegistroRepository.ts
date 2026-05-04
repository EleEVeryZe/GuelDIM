import { RegistroRepository } from "../../domain/repositories/RegistroRepository";
import { Registro } from "../../domain/entities/Registro";
import localData from './../../../public/data.json';

export class LocalRegistroRepository implements RegistroRepository {
    private static instance: LocalRegistroRepository;
    data: Registro[];
    file = {
        id: "localfile",
        name: "localfile"
    }

    private constructor() {
        this.data = localData as unknown as Registro[];
    }

    public static getInstance(): LocalRegistroRepository {
        if (!LocalRegistroRepository.instance) {
            LocalRegistroRepository.instance = new LocalRegistroRepository();
        }
        return LocalRegistroRepository.instance;
    }

    async getAll(fileId: string): Promise<Registro[]> {
        return await Promise.resolve(this.data);
    }

    async add(fileId: string, registros: Registro[]): Promise<void> {
        let existing = await this.getAll(this.file.id);
        existing = [...existing, ...registros];
    }

    async update(fileId: string, registros: Registro[]): Promise<void> {
        let existing = await this.getAll(this.file.id);
        const filtered = existing.filter(reg => reg.id != registros.at(0).id);
        existing = [...filtered, ...registros];
    }

    async remove(fileId: string, registroId: string): Promise<void> {
        const existing = await this.getAll(this.file.id);
        const filtered = existing.filter((r) => r.id !== registroId);
        await this.update(this.file.id, filtered);
    }

    async createFile(name: string, initialContent: string): Promise<{ id: string }> {
        return { id: this.file.id };
    }

    async listFiles(): Promise<Array<{ id?: string; name?: string }>> {
        return [{ id: this.file.id, name: this.file.name }];
    }
}