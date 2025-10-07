'use client';

import Link from "next/link";

function Home() {
    return (
        <main>
            <section className="max-w-3xl w-full  mt-24">
                <div className="grid gap-6 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-lg">
                    <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
                        Bienvenue sur Si t&#39;as de l&#39;or
                    </h1>
                    <p className="text-lg text-slate-700">
                        Le jeu auquel vous allez jouer est un jeu de gestio nde ressource.
                    </p>
                    <p>
                        Si vous n'avaez pas encore de compte, vous pouvez en créer un en cliquant sur le lien d&#39;inscription.
                        <Link href={"/register"} className="text-[#00B9FF] underline">
                        S&#39;inscrire
                    </Link>
                    </p>
                    <p>
                        Si vous ne connaissais pas encore le jeu, vous pouvez lire les règles en cliquant sur le lien suivant : <Link href={"/rules"} className="text-[#00B9FF] underline">Règles de Si t'as de l'or</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Home;