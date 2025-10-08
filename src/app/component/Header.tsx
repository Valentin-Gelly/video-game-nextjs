'use client';

import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import {GlobalContext,} from "@/context/globalContext";
import {useContext} from "react";
import {useRouter} from "next/navigation";
import {signOut} from "@/lib/auth-client";

export default function Header() {
    const router = useRouter()
    const {token, setToken, idUser, setIdUser} = useContext(GlobalContext)

    return (
        <header
            className={'absolute top-0 left-0 w-full flex items-center justify-between px-8 py-4 bg-white/60 backdrop-blur-xl shadow-md h-[15vh]'}>
            <Link href="/">
                <Image
                    src="/logo.png"
                    alt="Cita de l'or"
                    width={350}
                    height={40}
                    priority
                    className="object-contain "
                />
            </Link>
            {
                token ? (
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard/user">
                            Mon profil
                        </Link>
                        <button
                            onClick={() => {
                                setToken('');
                                setIdUser('');
                                localStorage.removeItem('token');
                                localStorage.removeItem('idUser');
                                router.push('/');
                                signOut();
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                            Déconnexion
                        </button>
                    </div>
                    ) :
                    <Link
                        href="/sign-in">
                        Connexion
                    </Link>
            }

        </header>
    );
}
