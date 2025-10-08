import Image from "next/image";

export default function GameCard({
  name,
  description,
  backgroundColors,
}: {
  name: string;
  description: string;
  backgroundColors: { top: string; bottom: string };
}) {
  const { top, bottom } = backgroundColors;
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
      <div
        className="absolute inset-0 flex flex-col justify-between p-4 duration-300 z-10 text-white"
        onClick={() =>
          document.getElementById("my_modal_99999999")!.showModal()
        }
      >
        <div>
          <h2 className="text-lg font-bold mb-1">{name}</h2>
          <p className="text-xs">{description}</p>
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
          </div>
        </div>
      </div>
      <dialog id="my_modal_99999999" className="modal">
        <div className="modal-box bg-white rounded-2xl shadow-lg border border-[#A8D8B9]">
          <h3 className="font-bold text-lg text-[#4B4E6D]">Role du {name}</h3>
          <p className="py-4 text-slate-600">{description}</p>

          <div className="modal-action flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const modal = document.getElementById(
                  "my_modal_1"
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
