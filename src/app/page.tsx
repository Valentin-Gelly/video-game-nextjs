"use client";

import Link from "next/link";
import { GlobalContext } from "@/context/globalContext";
import { useContext } from "react";

export default function Home() {
    const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("GlobalContext not available");
  const { token } = ctx;

  return (
    <main className="flex items-center justify-center w-full ">
      <section className="w-full space-y-8  mt-[20vh] sm:max-w-7xl px-4 sm:px-0">
        <div
          className="grid gap-6 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl border"
          style={{ borderColor: "#A8D8B9" }}
        >
          <h1
            className="text-4xl sm:text-5xl font-bold text-center"
            style={{ color: "#4B4E6D" }}
          >
            Bienvenue sur{" "}
            <span style={{ color: "#7D5B3A" }}>Si t&apos;as de l&apos;or</span>
          </h1>

          <p className="text-lg leading-relaxed" style={{ color: "#4B4E6D" }}>
            Le jeu auquel vous allez jouer est un jeu de{" "}
            <strong>gestion de ressources</strong>. Construisez, échangez et
            accumulez l’or pour devenir le plus grand marchand du royaume.
          </p>

          <p className="text-slate-700">
            Si vous n&apos;avez pas encore de compte, vous pouvez en créer un en
            cliquant sur le lien d&apos;inscription :
            <Link
              href="/register"
              className="ml-1 font-semibold underline"
              style={{ color: "#4B4E6D" }}
            >
              S&apos;inscrire
            </Link>
          </p>

          <p className="text-slate-700">
            Pour découvrir les règles, cliquez ici :
            <Link
              href="/rules"
              className="ml-1 font-semibold underline"
              style={{ color: "#4B4E6D" }}
            >
              Règles de Si t&apos;as d&apos;l&apos;or
            </Link>
          </p>
        </div>

        {!token ? (
          <div className="text-center">
            <Link href="/sign-in"
              className="inline-block w-[50%] px-6 py-3 rounded-xl font-semibold text-white shadow-lg text-lg transition-transform duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(90deg, #4B4E6D, #7D5B3A)",
              }}>Connexion</Link>
          </div>
        ) : <div className="text-center">
          <Link
            href="/games/lobby"
            className="inline-block w-[50%] px-6 py-3 rounded-xl font-semibold text-white shadow-lg text-lg transition-transform duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(90deg, #4B4E6D, #7D5B3A)",
            }}
          >
            Se connecter à une partie
          </Link>
        </div>
        }
      </section>
      {/* Bouton principal */}

    </main>
  );
}
