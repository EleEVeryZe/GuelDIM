import { IItemBase } from "@/interfaces/baseItem";
import { ItemBaseUseCase } from "@/domain/usecases/ItemBaseUseCase";
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState, useSyncExternalStore, useRef } from "react";

// Static empty array reference to prevent useSyncExternalStore infinity loops
const EMPTY_ARRAY: any[] = [];
const NOOP_UNSUBSCRIBE = () => {};

export function createItemContext<
  T extends IItemBase,
  U extends ItemBaseUseCase<T>
>() {
  type ItemContextValue = {
    allItems: T[];
    filtered: T[];
    useCase: U | null;
    isLoadingFile: boolean;
    isWritingToApi: boolean;
    isReadingFromApi: boolean;
    add(item: T): Promise<void>;
    getAll(): Promise<T[]>;
    update(items: T[]): Promise<void>;
    remove(id: string): Promise<T[]>;
  };

  interface ItemProviderProps {
    children: ReactNode;
    createUseCase: () => Promise<U>;
  }

  const ItemContext = createContext<ItemContextValue | undefined>(undefined);

  const ItemProvider: React.FC<ItemProviderProps> = ({ children, createUseCase }) => {
    const [useCase, setUseCase] = useState<U | null>(null);
    const [isLoadingFile, setIsLoadingFile] = useState(true);
    const [isWritingToApi, setIsWritingToApi] = useState(false);
    const [isReadingFromApi, setIsReadingFromApi] = useState(false);

    const createUseCaseRef = useRef(createUseCase);
    useEffect(() => {
      createUseCaseRef.current = createUseCase;
    }, [createUseCase]);

    useEffect(() => {
      let isMounted = true;
      setIsLoadingFile(true);

      createUseCaseRef.current()
        .then((instance) => {
          if (isMounted) setUseCase(instance);
        })
        .catch(console.error)
        .finally(() => {
          if (isMounted) setIsLoadingFile(false);
        });

      return () => {
        isMounted = false;
      };
    }, []);

    const allItems = useSyncExternalStore(
      (callback) => {
        if (!useCase) return NOOP_UNSUBSCRIBE;
        return useCase.subscribe(callback);
      },
      () => (useCase ? useCase.itemFilterBaseService.allItems : EMPTY_ARRAY as T[])
    );

    const filtered = useSyncExternalStore(
      (callback) => {
        if (!useCase) return NOOP_UNSUBSCRIBE;
        return useCase.itemFilterBaseService.subscribe(callback);
      },
      () => (useCase ? useCase.itemFilterBaseService.filtered : EMPTY_ARRAY as T[])
    );

    const ensureUseCase = () => {
      if (!useCase) {
        throw new Error("Item useCase is not initialized");
      }
      return useCase;
    };

    const contextValue = useMemo<ItemContextValue>(() => ({
      allItems,
      filtered,
      useCase,
      isLoadingFile,
      isWritingToApi,
      isReadingFromApi,
      add: async (item: T) => {
        setIsWritingToApi(true);
        try {
          await ensureUseCase().add(item);
        } finally {
          setIsWritingToApi(false);
        }
      },
      getAll: async () => {
        setIsReadingFromApi(true);
        try {
          return await ensureUseCase().getAll();
        } finally {
          setIsReadingFromApi(false);
        }
      },
      update: async (items: T[]) => {
        setIsWritingToApi(true);
        try {
          await ensureUseCase().update(items);
        } finally {
          setIsWritingToApi(false);
        }
      },
      remove: async (id: string) => {
        setIsWritingToApi(true);
        try {
          return await ensureUseCase().remove(id);
        } finally {
          setIsWritingToApi(false);
        }
      },
    }), [useCase, isLoadingFile, isWritingToApi, isReadingFromApi, allItems, filtered]);

    return (
      <ItemContext.Provider value={contextValue}>
        {children}
      </ItemContext.Provider>
    );
  };

  const useItem = () => {
    const context = useContext(ItemContext);
    if (!context) throw new Error("useItem must be used within ItemProvider");
    return context;
  };

  return { ItemProvider, useItem };
}