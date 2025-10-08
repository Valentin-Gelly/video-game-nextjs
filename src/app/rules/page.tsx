import React from "react";

// Version sans shadcn/ui : pure Tailwind CSS
export default function CitadellesPage() {
    const CHARACTERS = [
        { id: 1, name: "Assassin", short: "Tue un personnage", details: "Le personnage ciblé ne joue pas pendant cette manche." },
        { id: 2, name: "Voleur", short: "Vole l'or", details: "Prend tout l'or d'un autre joueur (si présent)." },
        { id: 3, name: "Magicien", short: "Échange des cartes", details: "Échange des cartes Quartier avec un joueur ou la pioche." },
        { id: 4, name: "Roi", short: "Prend la couronne", details: "Reçoit de l'or pour les quartiers nobles (jaunes)." },
        { id: 5, name: "Évêque", short: "Protège la cité", details: "Protège des attaques et reçoit de l'or pour quartiers religieux (bleus)." },
        { id: 6, name: "Marchand", short: "Gagne +1 or", details: "Gagne 1 pièce supplémentaire et reçoit de l'or pour quartiers commerçants (verts)." },
        { id: 7, name: "Architecte", short: "Pioche + construit jusqu’à 3", details: "Pioche 2 cartes et peut construire jusqu'à 3 quartiers." },
        { id: 8, name: "Condottiere", short: "Détruit un quartier", details: "Peut détruire un quartier adverse et reçoit de l'or pour quartiers militaires (rouges)." }
    ];

    return (
        <main className="min-h-screen bg-slate-50 p-6 md:p-12 mt-32">
            <header className="mx-auto max-w-4xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold">Règles — Citadelles</h1>
                        <p className="mt-2 text-slate-600">Résumé clair et imprimable des règles du jeu de Bruno Faidutti.</p>
                    </div>
                </div>
                <section className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <h3 className="font-semibold">Objectif du jeu</h3>
                        <p className="mt-2 text-slate-700">Construire la plus belle cité composée de quartiers. La partie se termine quand un joueur a construit 8 quartiers : on compte ensuite les points.</p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow">
                        <h3 className="font-semibold">Mise en place</h3>
                        <ul className="mt-2 list-disc list-inside text-slate-700">
                            <li>Chaque joueur commence avec 2 pièces d'or et 4 cartes Quartier.</li>
                            <li>Le porteur de la couronne commence.</li>
                            <li>Personnages numérotés 1 à 8 — choisis secrètement chaque manche.</li>
                        </ul>
                    </div>
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-bold">Personnages</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {CHARACTERS.map((c) => (
                            <article key={c.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-slate-500">{c.id}</div>
                                        <h3 className="text-lg font-semibold">{c.name}</h3>
                                    </div>
                                </div>
                                <p className="mt-3 text-slate-600">{c.short}</p>
                                <details className="mt-2 text-slate-500">
                                    <summary className="cursor-pointer">Détails</summary>
                                    <p className="mt-2">{c.details}</p>
                                </details>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-8 max-w-4xl">
                    <h2 className="text-2xl font-bold">Déroulement d'une manche</h2>
                    <ol className="mt-4 list-decimal list-inside space-y-3 text-slate-700">
                        <li>Choix secret des personnages disponibles.</li>
                        <li>Les personnages jouent dans l'ordre (1 → 8).</li>
                        <li>À votre tour : prenez 2 pièces OU piochez 2 cartes (gardez-en 1). Puis vous pouvez construire 1 quartier (sauf Architecte).</li>
                        <li>Utilisez le pouvoir de votre personnage.</li>
                    </ol>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white p-4 shadow">
                            <h3 className="font-semibold">Fin de partie</h3>
                            <p className="mt-2 text-slate-700">La manche se termine quand un joueur a 8 quartiers. On compte les points (coûts des quartiers + bonus : +3 pour 8 quartiers, +2 si toutes les couleurs, +2 pour le premier fini).</p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow">
                            <h3 className="font-semibold">Couleurs des quartiers</h3>
                            <ul className="mt-2 list-inside">
                                <li>Jaune — Nobles (Roi)</li>
                                <li>Bleu — Religieux (Évêque)</li>
                                <li>Vert — Commerçant (Marchand)</li>
                                <li>Rouge — Militaire (Condottiere)</li>
                                <li>Violet — Spécial</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow">
                            <h3 className="font-semibold">Raccourcis utiles</h3>
                            <ul className="mt-2 list-disc list-inside text-slate-700">
                                <li>Architecte : peut construire jusqu'à 3 quartiers.</li>
                                <li>Assassin : supprime un personnage pour la manche.</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </header>
        </main>
    );
}
