'use client';

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { signIn } from "@/lib/auth-client";
import { GlobalContext } from "@/context/globalContext";

export default function SignUpPage() {
    const router = useRouter();
    const { token, setToken, setIdUser, idUser } = useContext(GlobalContext);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await signIn.email({
                email: formData.get("email") as string,
                password: formData.get("password") as string,
            });

            if (res.error) {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: res.error.message || "Une erreur est survenue.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Connexion réussie, bienvenue " + res.data.user.name,
                    showConfirmButton: false,
                    timer: 1500,
                });
                setIdUser(res.data.user.id);
                setToken(res.data.token);
                router.push("/");
                console.log(idUser)
            }
        } catch (err) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Erreur de connexion.",
                showConfirmButton: false,
                timer: 1500,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="w-full flex align-middle justify-center items-center flex-col h-[85vh]">
            <form
                className="grid gap-6 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-lg w-full max-w-3xl mx-auto mt-[15vh] "
                onSubmit={handleSubmit}
            >
                <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
                    Connexion
                </h1>

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
                    required
                    placeholder="Mot de passe"
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
                            <span>Connexion...</span>
                        </div>
                    ) : (
                        "Connexion"
                    )}
                </button>
            </form>

            <p className="text-center mt-6 text-slate-600 text-sm sm:text-base">
                Pas encore de compte ? <br />
                <Link href="/register" className="text-[#00B9FF] underline">
                    inscrivez-vous ici
                </Link>
                .
            </p>
        </section>
    );
}
