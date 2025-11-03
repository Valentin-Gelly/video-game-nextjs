import Image from "next/image";
import Swal from "sweetalert2";

export default function GameCard({
  id,
  name,
  description,
  price,
  backgroundColors,
  className,
  isPlayed,
  type,
  isPlayable,
  canBeBuilded,
  handleBuildCard,
  isCondotiere,
  onDestroyHandler
}: {
  id: number;
  name: string;
  description: string | undefined;
  price: string;
  backgroundColors: { top: string; bottom: string };
  className?: string;
  isPlayed?: boolean;
  type?: string;
  isPlayable?: boolean;
  canBeBuilded?: boolean;
  handleBuildCard?: () => void;
  isCondotiere?: boolean;
  onDestroyHandler?: () => void;
}) {
  const { top, bottom } = backgroundColors;

  const onBuildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modal = document.getElementById("my_modal_" + id) as HTMLDialogElement | null;
    if (modal) modal.close();

    if (!canBeBuilded) {
      Swal.fire({
        icon: "error",
        title: "Impossible de construire cette carte",
        text: "Vous n'avez pas assez de ressources pour la construire.",
      });
      return;
    }

    handleBuildCard?.(); // 🔹 joue la carte si possible
  };

  const deleteCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modal = document.getElementById("my_modal_" + id) as HTMLDialogElement | null;
    if (modal) modal.close();

    Swal.fire({
      title: "Êtes-vous sûr de vouloir défausser cette carte ?",
      text: "Vous ne pourrez pas la récupérer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, défausser",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        handleBuildCard?.(); // 🔹 ou ajouter handleDiscard si tu veux séparer
        Swal.fire("Défaussée !", "La carte a été défaussée.", "success");
      }
    });
  };


  return (
    <div
      className={
        "card group relative overflow-hidden " +
        (isPlayed
          ? "h-12 w-24"
          : "transform translate-y-1/4 transition-all duration-300 hover:-translate-y-0 hover:scale-110 hover:z-20 h-52 w-40 rounded-[10%] flex flex-col justify-end p-4 ") +
        (className ?? "")
      }
      style={{
        background: `linear-gradient(to bottom, ${top}, ${bottom})`,
      }}
      onClick={() => document.getElementById("my_modal_" + id)!.showModal()}
    >
      {/* Contenu principal masqué par défaut et visible au survol */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 duration-300 z-10 text-white">
        <div>
          <h2 className="text-lg font-bold mb-1">{name}</h2>
          {description && !isPlayed && <p className="text-xs">{description}</p>}
          {isPlayed ? (
            ""
          ) : (
            <div className="bg-[rgba(0,0,0,0.4)] flex items-center pl-1 pr-2 py-1 rounded-3xl gap-2 self-start w-fit">
              <div className="icon h-[25px] w-[25px] rounded-full grid place-content-center bg-white">
                <Image
                  src="/game/coin.png"
                  alt="Cita de l'or"
                  width={350}
                  height={40}
                  priority
                  className="object-contain"
                />
              </div>
              <p className="text-xs">{price}</p>
            </div>
          )}
        </div>
      </div>
      <dialog id={`my_modal_` + id} className="modal">
        <div className="modal-box bg-white rounded-2xl shadow-lg border border-[#A8D8B9]">
          <h3 className="font-bold text-lg text-[#4B4E6D]">Batiment {name}</h3>
          <p>Type de batiment : {type}</p>
          <p className="py-4 text-slate-600">{description}</p>
          <div className="modal-action flex justify-end gap-4 mt-6">
            {
              isPlayable ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={(e) => {
                    deleteCard(e);
                  }}
                >
                  Défausser la carte
                </button>
              ) : null
            }
            {
              isPlayable ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    onBuildClick(e);
                  }}
                >
                  Construire la carte
                </button>
              ) : null
            }
            {
              isPlayed && isCondotiere ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    onDestroyHandler(e);
                  }}
                >
                  Détruire le batiment
                </button>
              ) : null  
            }

            <button
              type="button"
              className="btn btn-ghost"
              onClick={(e) => {
                e.stopPropagation(); // <- très important
                const modal = document.getElementById(
                  "my_modal_" + id
                ) as HTMLDialogElement | null;
                if (modal) modal.close();
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
