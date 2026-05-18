export abstract class ItemBaseRepository<T> {
  abstract fileId: string;

  static createFile(name: string, initialContent: string): Promise<{ id: string }> {
    throw new Error("Método estático 'createFile()' deve ser implementado pela subclasse.");
  }

  static async listFiles(): Promise<Array<{ id?: string; name?: string }>> {
    throw new Error("Método estático 'listFiles()' deve ser implementado pela subclasse.");
  }

  abstract getAll(): Promise<T[]>;
  abstract add(Items: T[]): Promise<void>;
  abstract update(Items: T[]): Promise<void>;
  abstract remove(ItemId: string): Promise<void>;
  abstract updateAllIdComum(Items: T[]): Promise<void>;
  abstract getLastUpdate(): Promise<T>;
}