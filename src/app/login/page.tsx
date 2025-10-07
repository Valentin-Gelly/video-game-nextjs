'use client';

function Login() {
    return (
        <main className="min-h-screen bg-[#F5F3F0] text-[#0F172A] flex items-center justify-center py-20 px-4">

            <section className="max-w-3xl w-full  mt-24">
                <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
                    Connexion
                </h1>
                <form className="grid gap-6 bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-lg">
                    <input
                        type="text"
                        placeholder="Nom"
                        disabled
                        className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100 cursor-not-allowed focus:outline-none"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        disabled
                        className="px-4 py-3 rounded-full border border-slate-300 bg-slate-100 cursor-not-allowed focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled
                        className="px-6 py-3 rounded-2xl bg-gray-400 text-white font-semibold shadow-lg cursor-not-allowed"
                    >
                        Formulaire temporairement désactivé
                    </button>
                </form>

                <p className="text-center mt-6 text-slate-600 text-sm sm:text-base">
                    ⚡ Le formulaire est désactivé pour le moment. <br/>
                    Ou <a
                    href="https://calendly.com/contact-aven-ia/30min"
                    target="_blank"
                    className="text-[#00B9FF] underline">
                    réservez directement un créneau en ligne
                </a>.
                </p>
            </section>
        </main>
    );
}

export default Login;