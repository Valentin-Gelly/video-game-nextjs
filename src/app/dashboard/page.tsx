import React from "react";
import {GameInfo} from "@/api/interfaces/GameInfo";

export default async function Dashboard() {

    const userId = 34;

    const res = await fetch(`/api/users/${userId}/games`, {cache: 'no-store'}).catch(err => {
        console.error("Failed to fetch scores:", err);
        return new Response("[]", {status: 500});
    });
    const scores = await res.json();

    return (
        <main className="min-h-[80vh] w-full bg-slate-50 p-8 mt-[20vh] sm:mt-[10vh]">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Tableau des scores — Citadelles</h1>
                <p className="text-slate-600 mt-2">Clique sur une partie pour voir tous les détails.</p>
            </header>
            <div className="overflow-x-auto rounded-2xl shadow bg-white">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">Score</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                    {scores.map((s: GameInfo) => (
                        <tr key={s.id} className="hover:bg-slate-50 cursor-pointer"
                            onClick={() => window.location.href = `/citadelles/partie/${s.id}`}>
                            <th className="px-6 py-3 text-left font-medium tracking-wider text-slate-600">
                                {new Date(s.createdAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </th>
                            <th className="px-6 py-3 text-left  font-medium uppercase tracking-wider text-slate-600">{s.result}</th>
                            <th className="px-6 py-3 text-left  font-medium uppercase tracking-wider text-slate-600">{s.score}</th>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </main>
    );
}
