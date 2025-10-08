import Image from "next/image";

export default function RoleCard({
  id,
  name,
  description,
  price,
  backgroundColors,
  className,
  type,
}: {
  id: number;
  name: string;
  description: string;
  price: string;
  backgroundColors: { top: string; bottom: string };
  className?: string;
  type?: String;
}) {
  const { top, bottom } = backgroundColors;
  return (
    <div
      className={
        "card group relative flex flex-col justify-end p-4 rounded-[10%] overflow-hidden h-52 w-40 " +
        "transform translate-y-1/4 transition-all duration-300 hover:-translate-y-0 hover:scale-110 hover:z-20 " +
        className
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
            <p className="text-xs">{price}</p>
          </div>
        </div>
      </div>
      <dialog id={`my_modal_` + id} className="modal">
        <div className="modal-box bg-white rounded-2xl shadow-lg border border-[#A8D8B9]">
          <h3 className="font-bold text-lg text-[#4B4E6D]">Batiment {name}</h3>
          <p>Type de batiment :</p>
          <p className="py-4 text-slate-600">{description}</p>

          <div className="modal-action flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const modal = document.getElementById(
                  "my_modal_" + id
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
