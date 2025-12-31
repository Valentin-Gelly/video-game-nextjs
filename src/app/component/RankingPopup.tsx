import { Ranking } from "@/server/gameManager";
import Swal from "sweetalert2";

export function showEndGamePopup(results: Ranking[]) {
  const isDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#e5e7eb' : '#111827';

  const htmlContent = `
    <div style="text-align: center; color: ${textColor};">
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
        🎉 Fin de la partie ! 🎉
      </h2>

      <table style="width: 100%; text-align: left; border-collapse: collapse; color: ${textColor};">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
            <th style="padding: 8px;">Joueur</th>
            <th style="padding: 8px;">Points</th>
            <th style="padding: 8px;">Bonus</th>
            <th style="padding: 8px;">Quartiers</th>
          </tr>
        </thead>
        <tbody>
          ${results
            .map(
              (p, i) => `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); ${
                i === 0 ? "background: #fff3a3; font-weight: bold;" : ""
              }">
                <td style="padding: 8px;">${i === 0 ? "👑 " : ""}${p.name}</td>
                <td style="padding: 8px;">${p.points}</td>
                <td style="padding: 8px;">${p.bonus}</td>
                <td style="padding: 8px;">${p.citySize}</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
      
    </div>
  `;

  Swal.fire({
    title: "Résultats de la partie",
    html: htmlContent,
    width: 700,
    background: bgColor,
    color: textColor,
    showConfirmButton: true,
    confirmButtonText: "Retour au lobby",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: true,
    confirmButtonColor: isDark ? '#374151' : undefined,
  }).then((result) => {
    if (result.isConfirmed) {
      if (typeof window !== "undefined") {
        window.location.href = "/games/lobby";
      }
    }
  });
}
