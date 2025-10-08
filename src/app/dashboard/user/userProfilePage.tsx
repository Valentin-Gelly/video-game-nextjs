"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Pencil, PencilOff } from "lucide-react";

export default function UserProfilePage() {
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editableFields, setEditableFields] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
      credentials: "include",
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Profil mis à jour",
        showConfirmButton: false,
        timer: 1500,
      });
      setEditableFields([]);
    } else {
      Swal.fire({
        icon: "error",
        title: "Erreur lors de la mise à jour",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    setSaving(false);
  }

  const toggleEditable = (field: string) => {
    setEditableFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="w-8 h-8 border-4 border-[#7D5B3A] border-t-transparent rounded-full animate-spin"></span>
      </div>
    );

  const renderField = (
    label: string,
    field: keyof typeof user,
    type: string = "text"
  ) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <input
        type={type}
        value={user[field]}
        onChange={(e) => setUser({ ...user, [field]: e.target.value })}
        placeholder={label}
        disabled={!editableFields.includes(field)}
        className={`flex-1 px-4 py-3 rounded-full border border-slate-300 bg-slate-100 focus:outline-none ${
          editableFields.includes(field) ? "bg-white border-[#7D5B3A]" : ""
        }`}
      />
      <button
        type="button"
        onClick={() => toggleEditable(field)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          editableFields.includes(field)
            ? "bg-[#A8D8B9] text-[#4B4E6D]"
            : "bg-[#C2B280] text-[#4B4E6D]"
        }`}
      >
        {editableFields.includes(field) ? <PencilOff /> : <Pencil />}
      </button>
    </div>
  );

  return (
    <section className="flex flex-col items-center mt-[15vh] w-full">
      <h1 className="text-4xl font-bold mb-8 text-[#4B4E6D]">
        Mon profil utilisateur
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white/70 backdrop-blur-xl shadow-lg rounded-3xl p-8 sm:p-10 w-full grid gap-6 max-w-3xl"
      >
        <div className="grid sm:grid-cols-2 gap-6">
          {renderField("Prénom", "firstname")}
          {renderField("Nom", "lastname")}
        </div>

        {renderField("Nom d’utilisateur", "username")}
        {renderField("Email", "email", "email")}

        {editableFields.length > 0 && (
          <button
            type="submit"
            disabled={saving}
            className={`mt-6 px-6 py-3 rounded-2xl font-semibold w-1/2 mx-auto cursor-pointer text-white transition-all duration-300 ${
              saving
                ? "bg-[#7D5B3A]/70 cursor-not-allowed"
                : "bg-[#7D5B3A] hover:shadow-lg hover:scale-105"
            }`}
          >
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </button>
        )}
      </form>
    </section>
  );
}
