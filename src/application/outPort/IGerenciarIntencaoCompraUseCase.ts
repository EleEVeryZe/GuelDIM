import { IntencaoCompra } from "@/domain/entities/intencao-compra";
import { ICompra, EfetivarCompraParcialOutput, IIntencaoCompra, RegistrarCotacaoInput, RegistrarVendaInput } from "@/interfaces/intencao-compra";

export interface IGerenciarIntencaoCompraUseCase {
    criarNovaIntencao(id: string, produto: any): Promise<void>;
    registrarCotacao(input: RegistrarCotacaoInput): Promise<IIntencaoCompra>;
    efetivarCompraParcial(input: ICompra): Promise<EfetivarCompraParcialOutput>;
    registrarVenda(input: RegistrarVendaInput): Promise<IIntencaoCompra>;
}

export interface IIntencaoCompraRepository {
    buscarPorId(id: string): Promise<IntencaoCompra | null>;
    criarIntencao(intencao: IntencaoCompra): Promise<void>;
    buscarTodos(): Promise<IntencaoCompra[]>
}