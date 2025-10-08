"use client";

import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";

interface GlobalContextType {
    token: string | null;
    setToken: Dispatch<SetStateAction<string | null>>;
    idUser: string | null;
    setIdUser: Dispatch<SetStateAction<string | null>>;
}

export const GlobalContext = createContext<GlobalContextType | null>(null);

interface GlobalProviderProps {
    children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
    const [token, setToken] = useState<string | null>(null);
    const [idUser, setIdUser] = useState<string | null>(null);

    // ✅ Charger les données après le montage (donc côté client)
    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        const storedIdUser = sessionStorage.getItem("idUser");
        if (storedToken) setToken(storedToken);
        if (storedIdUser) setIdUser(storedIdUser);
    }, []);

    // ✅ Sauvegarder quand le token change
    useEffect(() => {
        if (token) {
            sessionStorage.setItem("token", token);
        } else {
            sessionStorage.removeItem("token");
        }
    }, [token]);

    // ✅ Sauvegarder quand l’id change
    useEffect(() => {
        if (idUser) {
            sessionStorage.setItem("idUser", idUser);
        } else {
            sessionStorage.removeItem("idUser");
        }
    }, [idUser]);

    return (
        <GlobalContext.Provider value={{ token, setToken, idUser, setIdUser }}>
            {children}
        </GlobalContext.Provider>
    );
};
