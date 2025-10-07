'use client';

import Link from "next/link";

function Login() {
    return (
        <>
            <section className="max-w-3xl w-full  mt-24">

                <form className="grid gap-6 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-lg">
                    <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
                        Connexion
                    </h1>
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100  focus:outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100  focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-2xl font-semibold  w-1/2 mx-auto cursor-pointer hover:shadow-lg"
                    >
                        Connexion
                    </button>
                </form>

                <p className="text-center mt-6 text-slate-600 text-sm sm:text-base">
                    Pas encore de compte ? <br/>
                    <Link
                        href="/register"
                        className="text-[#00B9FF] underline">
                        {" "} inscrivez-vous ici
                    </Link>.
                </p>
            </section>
        </>
    );
}

export default Login;