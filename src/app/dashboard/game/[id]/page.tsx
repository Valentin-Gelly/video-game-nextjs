'use client'


import React from "react";
import { useParams } from 'next/navigation'

export default function GameDetail(){

    const params = useParams<{ id: string; }>()

    return (
        <main className="min-h-[80vh] w-full bg-slate-50 p-8 sm:mt-[10vh]">
            {params.id}
        </main>
    );
}
