"use client";

import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import { GlobalContext } from "@/context/globalContext";
import { useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import path from "path";

export default function Header() {
  const router = useRouter();
  const { token, setToken, idUser, setIdUser } = useContext(GlobalContext);

  const pathname = usePathname();

  return (
    <header
      className={
        "absolute top-0 left-0 w-full flex items-center justify-between px-8 py-4 bg-white/60 backdrop-blur-xl shadow-md " +
        (pathname === "/game/game-table" ? "h-4" : "h-[15vh]")
      }
    >
      {pathname === "/game/game-table" ? null : (
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Cita de l'or"
            width={350}
            height={40}
            priority
            className="object-contain "
          />
        </Link>
      )}

      {token ? (
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/user">Mon profil</Link>
          <button
            onClick={() => {
              setToken(null);
              setIdUser(null);
              localStorage.removeItem("token");
              localStorage.removeItem("idUser");
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("idUser");
              router.push("/");
            }}
            className={
              " bg-red-500 text-white rounded-lg hover:bg-red-600 transition" +
                pathname ==
              "/game/game-table"
                ? " px-2 py-1 text-sm"
                : " px-4 py-2"
            }
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <Link href="/sign-in">Connexion</Link>
      )}
    </header>
  );
}
