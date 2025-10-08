"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { GlobalContext } from "@/context/globalContext";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { token, setToken, setIdUser } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);

  if (token) {
    router.push("/dashboard/user");
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    console.log(event.target.elements);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: event.target.elements.email.value,
        password: event.target.elements.password.value,
        lastname: event.target.elements.lastname.value,
        firstname: event.target.elements.firstname.value,
        username: event.target.elements.username.value,
      }),
    });
    console.log(res);
    const result = await res.json();

    if (res.ok) {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Votre compte a été créer veuillez confirmer votre email",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "" + result.error,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <section className="w-full flex align-middle justify-center items-center flex-col h-[85vh]">
      <form
        onSubmit={onSubmit}
        className="grid gap-6 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-lg w-full max-w-3xl mx-auto mt-[15vh]"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
          Inscription
        </h1>
        {/*//TODO: Ajouter dans la page de données personnel la possibilité de rajouter les données dans l'entité userpersonal data*/}
        <div className="grid sm:grid-cols-2 gap-6">
          <input
            name="firstname"
            placeholder="Prénom"
            required
            className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100 focus:outline-none"
          />
          <input
            name="lastname"
            placeholder="Nom"
            required
            className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100 focus:outline-none"
          />
        </div>

        <input
          name="username"
          placeholder="Nom d'utilisateur"
          required
          className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100 focus:outline-none"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100 focus:outline-none"
        />

        <input
          name="password"
          type="password"
          placeholder="Mot de passe (min. 8 caractères)"
          required
          minLength={8}
          className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-3 rounded-2xl font-semibold w-1/2 mx-auto cursor-pointer text-white transition-all duration-300 ${
            isLoading
              ? "bg-[#7D5B3A]/70 cursor-not-allowed"
              : "bg-[#7D5B3A] hover:shadow-lg hover:scale-105"
          }`}
        >
          {isLoading ? (
            <div className="flex justify-center items-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Création...</span>
            </div>
          ) : (
            "Créer un compte"
          )}
        </button>
      </form>

      <p className="text-center mt-6 text-slate-600 text-sm sm:text-base">
        Vous avez déjà un compte ? <br />
        <Link href="/sign-in" className="text-[#00B9FF] underline">
          Connectez-vous ici
        </Link>
        .
      </p>
    </section>
  );
}
