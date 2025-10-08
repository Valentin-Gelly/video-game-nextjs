"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

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
  const router = useRouter();

  const [init, setInit] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [idUser, setIdUser] = useState<string | null>(null);

  useEffect(() => {
    console.log("GlobalContext init:", init);
    const storedToken = sessionStorage.getItem("token");
    const storedIdUser = sessionStorage.getItem("idUser");
    if (storedToken) setToken(storedToken);
    if (storedIdUser) setIdUser(storedIdUser);
    setInit(false);
  }, []);

  useEffect(() => {
    if (token) {
      console.log("GlobalContext token if:", token);
      sessionStorage.setItem("token", token);
    } else if (!token) {
      console.log("GlobalContext token else:", token);
      sessionStorage.removeItem("token");
      setInit(false);
    }
  }, [router, token]);

  return (
    <GlobalContext.Provider value={{ token, setToken, idUser, setIdUser }}>
      {children}
    </GlobalContext.Provider>
  );
};
