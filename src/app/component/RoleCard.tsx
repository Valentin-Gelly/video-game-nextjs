import Image from "next/image";

export default function RoleCard({
  name,
  description,
  backgroundColors,
  choiceHandler
}: {
  readonly name?: string;
  readonly description?: string;
  readonly backgroundColors: { top: string; bottom: string };
  readonly choiceHandler?: () => void;
}) {
  const { top, bottom } = backgroundColors;
  
  const idModal = "role_modal_"+name;
  
  return (
    <div
      className={
        "card group relative flex flex-col justify-end p-4 rounded-[10%] overflow-hidden h-52 w-40 "
      }
      style={{
        background: `linear-gradient(to bottom, ${top}, ${bottom})`,
      }}
    >
      {/* Contenu principal masqué par défaut et visible au survol */}
      <button
        className="absolute inset-0 flex flex-col justify-between p-4 duration-300 z-10 text-white bg-transparent border-none cursor-pointer"
        onClick={() =>
          (document.getElementById("role_modal_"+name) as HTMLDialogElement)?.showModal()
        }
        aria-label={`Afficher les détails du rôle ${name}`}
      >
        <div className="text-center">
          {description != "" ? (
            <h2 className="text-lg font-bold mb-1">{name}</h2>
          ) : (
            <h2 className="inline-block text-xl font-bold text-center mx-auto">
              {name}
            </h2>
          )}
          {description != "" ? (
            <p className="text-xs text-left">{description}</p>
          ) : (
            ""
          )}
        </div>
      </button>
      <dialog id={idModal} className="modal">
        <div className="modal-box bg-white rounded-2xl shadow-lg border border-[#A8D8B9]">
          <h3 className="font-bold text-lg text-[#4B4E6D]">Role du {name}</h3>
          <p className="py-4 text-slate-600">{description}</p>

          <div className="modal-action flex justify-end gap-4 mt-6">
            {
              choiceHandler ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    choiceHandler();
                  }}
                >
                  Choisir ce rôle
                </button>
              ) : null
            }
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const modal = document.getElementById(
                  idModal
                ) as HTMLDialogElement;
                modal.close();
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
