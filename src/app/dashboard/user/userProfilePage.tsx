'use client';

import React, {useContext, useEffect, useState} from "react";
import {GlobalContext} from "@/context/globalContext";
import {useRouter} from "next/navigation";

export default function UserProfilePage() {
    const router = useRouter();

    const {token, setToken, setIdUser, idUser} = useContext(GlobalContext)
    const [userData, setUserdata] = useState(null);

    if (!token) {
        router.push('/sign-in')
    }

    useEffect(() => {
        async function loadScores() {
            if (!idUser) return;

            try {
                const response = await fetch(`/api/users/${idUser}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserdata(data);
                    console.log(userData)
                } else {
                    console.error("Erreur lors de la récupération des scores");
                }
            } catch (error) {
                console.error("Erreur réseau:", error);
            }
        }
        loadScores()
    }, [idUser, userData]);


    return (
        <main
            className="flex items-center justify-center"
        >

        </main>
    );
}
