const sessionPersistence = (sessionState: Storage) => {
    return {
        getItem: (name: "filtro" | "file") => {
            return sessionState.getItem(name)
        },
        setItem: (name: "filtro" | "file", content: string) => {
            return sessionState.setItem(name, content)
        },
    }
}

export default sessionPersistence;