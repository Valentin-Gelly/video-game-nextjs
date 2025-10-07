'use client';

import Link from "next/link";

function Register() {
    return (
        <>
            <section className="max-w-3xl w-full mt-24">
                <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
                    Créer un compte
                </h1>
                <form className="grid gap-6 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-lg">
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100  focus:outline-none"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100  focus:outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100  focus:outline-none"
                    />
                    <input
                        type="password"
                        placeholder="mot de passe"
                        className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100  focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl bg-gray-400 text-white font-semibold shadow-lg "
                    >
                        Créer un compte
                    </button>
                </form>

                <p className="text-center mt-6 text-slate-600 text-sm sm:text-base">
                    Déjà un compte ? <br/>

                    <Link
                        href="/login"
                        className="text-[#00B9FF] underline">
                        Connectez-vous ici
                    </Link>.
                </p>
            </section>
        </>
    );
}

export default Register;