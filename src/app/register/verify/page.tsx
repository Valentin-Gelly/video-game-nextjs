"use client";

import { Suspense } from "react";
import VerifyContent from "./client";

function LoadingFallback() {
  return (
    <section className="flex flex-col justify-center items-center min-h-[80vh] text-center px-6">
      <div className="flex flex-col items-center gap-4">
        <span className="w-10 h-10 border-4 border-[#7D5B3A] border-t-transparent rounded-full animate-spin"></span>
        <p className="text-lg text-gray-700">Vérification en cours...</p>
      </div>
    </section>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyContent />
    </Suspense>
  );
}
