"use client";

import Image from "next/image";
import GameList from "@/app/dashboard/page";
import { useState } from "react";
import UserProfilePage from "@/app/dashboard/user/userProfilePage";
import { useContext } from "react";
import { GlobalContext } from "@/context/globalContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Profil() {
  const [activePage, setActivePage] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("GlobalContext not available");
  const { setToken, setIdUser } = ctx;
  const router = useRouter();

  return (
    <main className="flex md:flex-column items-center justify-center">
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-black rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only"></span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        ></button>
      )}
      <aside
        className={`fixed md:top-[15vh] top-0 left-0 z-40 w-64 md:h-[85vh] h-full bg-gray-50 shadow-lg transition-transform
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <ul className="space-y-2 font-medium flex flex-col justify-between md:h-[80vh] h-full">
            <div className="flex flex-col gap-4">
              <>
                <Link href="/" className="block md:hidden">
                  <Image
                    src="/logo.png"
                    alt="Cita de l'or"
                    width={350}
                    height={40}
                    priority
                    className="object-contain dark:invert"
                  />
                </Link>
              </>
              <li>
                <button
                  onClick={() => setActivePage("profile")}
                  className={`cursor-pointer flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full ${activePage === "profile" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                >
                  <svg
                    className="w-5 h-5 text-black transition duration-75 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 21"
                  >
                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                  </svg>
                  <span className="ms-3">Mes données</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage("games")}
                  className={`w-full cursor-pointer flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${activePage === "games" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                >
                  <svg
                    className="shrink-0 w-5 h-5 text-black transition duration-75 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                  >
                    <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                  </svg>
                  <span className="ms-3">Historique des parties</span>
                </button>
              </li>
            </div>
            <div>
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  onClick={() => {
                    setToken(null);
                    setIdUser(null);
                    localStorage.removeItem("token");
                    localStorage.removeItem("idUser");
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("idUser");
                    router.push("/");
                  }}
                >
                  <Image
                    src={"/logout.svg"}
                    alt={"logout"}
                    width={20}
                    height={20}
                  />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Se déconnecter
                  </span>
                </a>
              </li>
            </div>
          </ul>
        </div>
      </aside>

      <div className="p-4 md:ml-64 w-full">
        {activePage === "profile" ? (
          <UserProfilePage></UserProfilePage>
        ) : (
          <GameList></GameList>
        )}
      </div>
    </main>
  );
}
