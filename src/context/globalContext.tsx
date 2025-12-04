"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo
} from "react";

interface GlobalContextType {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
  idUser: string | null;
  setIdUser: Dispatch<SetStateAction<string | null>>;
  userName: string | null;
  setUserName: Dispatch<SetStateAction<string | null>>;
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
  const [userName, setUserName] = useState<string | null>(null);
  const value = useMemo(
    () => ({ token, setToken, idUser, setIdUser, userName, setUserName }),
    [token, setToken, idUser, setIdUser, userName, setUserName]
  );

  useEffect(() => {
    console.log("GlobalContext init:", init);
    const storedToken = sessionStorage.getItem("token");
    const storedIdUser = sessionStorage.getItem("idUser");
    const storedUserName = sessionStorage.getItem("userName");
    if (storedToken) setToken(storedToken);
    if (storedIdUser) setIdUser(storedIdUser);
    if (storedUserName) setUserName(storedUserName);
    setInit(false);
  }, []);

  useEffect(() => {
    if (token && userName && idUser) {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userName", userName);
      sessionStorage.setItem("idUser", idUser);
    } else if (!token) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("idUser");
      setInit(false);
    }
  }, [router, token, userName]);

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};
