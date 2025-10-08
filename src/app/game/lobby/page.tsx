"use client";

import { GlobalContext } from "@/context/globalContext";
import Link from "next/link";
import { useContext } from "react";
import { useRouter } from "next/navigation";

export default function Lobby() {

  return (
    <main className="flex items-center justify-center h-screen">
      <section className="w-full space-y-8 ">
        <div
          className="grid gap-6 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-xl border max-w-7xl mx-auto"
          style={{ borderColor: "#A8D8B9" }}
        >
          <h1
            className="text-4xl sm:text-5xl font-bold text-center"
            style={{ color: "#4B4E6D" }}
          >
            Bienvenue dans le lobby de Si t&apos;as de l&apos;or !
          </h1>

          <p className="text-lg leading-relaxed" style={{ color: "#4B4E6D" }}>
            Vous aller pouvoir rejoindre ou créer des parties à partir de cette
            page.
          </p>
        </div>

        {/* Bouton principal */}
        <div className="text-center">
          <Link
            href="/lobby"
            className="inline-block w-[50%] px-6 py-3 rounded-xl font-semibold text-white shadow-lg text-lg transition-transform duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(90deg, #4B4E6D, #7D5B3A)",
            }}
          >
            Se connecter à une partie
          </Link>
        </div>

        {/* Petit footer */}
        <p
          className="text-center text-sm opacity-80 mt-4"
          style={{ color: "#4B4E6D" }}
        >
          © 2025 — Si t&apos;as de l&apos;or
        </p>
      </section>
    </main>
  );
}
