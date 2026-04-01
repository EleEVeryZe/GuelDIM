import { Investment as InvestmentInterface, InvestmentOperation as InvestmentOperationInterface } from "../../interfaces/interfaces";

// Re-export the existing domain model from shared interface to avoid duplication.
export type Investment = InvestmentInterface;
export type InvestmentOperation = InvestmentOperationInterface;