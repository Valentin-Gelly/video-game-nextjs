"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Vérification en cours...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification invalide.");
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`, {
          method: "GET",
        });

        if (res.ok) {
          setStatus("success");
          setMessage("Votre compte a bien été vérifié 🎉");
          // tu peux aussi rediriger automatiquement après quelques secondes :
          // setTimeout(() => router.push("/sign-in"), 3000);
        } else {
          const data = await res.json();
          setStatus("error");
          setMessage(data.error || "Le lien n'est plus valide ou a expiré.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Une erreur est survenue lors de la vérification.");
      }
    };

    verifyAccount();
  }, [token, router]);

  return (
    <section className="flex flex-col justify-center items-center min-h-[80vh] text-center px-6">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-[#7D5B3A] border-t-transparent rounded-full animate-spin"></span>
          <p className="text-lg text-gray-700">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-[#A8D8B9]/40 backdrop-blur-lg border border-[#A8D8B9] p-8 rounded-3xl shadow-lg max-w-md">
          <h1 className="text-3xl font-bold text-[#4B4E6D] mb-3">
            🎉 Félicitations !
          </h1>
          <p className="text-gray-700 mb-6">{message}</p>
          <Link
            href="/sign-in"
            className="px-6 py-3 bg-[#7D5B3A] text-white rounded-full hover:scale-105 transition-all"
          >
            Se connecter
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-8 rounded-3xl shadow-md max-w-md">
          <h1 className="text-3xl font-bold mb-3">❌ Erreur</h1>
          <p className="mb-6">{message}</p>
          <Link
            href="/register"
            className="px-6 py-3 bg-[#4B4E6D] text-white rounded-full hover:scale-105 transition-all"
          >
            Revenir à l'inscription
          </Link>
        </div>
      )}
    </section>
  );
}

export default VerifyContent;
