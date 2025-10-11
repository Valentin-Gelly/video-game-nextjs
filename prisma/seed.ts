import { PrismaClient } from "../src/generated/prisma";
import data from "./buildingCard.json";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Reset database...");
  await prisma.building.deleteMany();
  await prisma.roleCard.deleteMany();
  await prisma.roleCard.deleteMany();

  console.log("🧙 Creating roles (GameRole)...");
  const roles = [
    {
      name: "Assassin",
      order: 1,
      description:
        "L'Assassin peut assassiner un autre personnage ; le joueur ayant le personnage assassiné ne joue pas ce tour-là.",
      color: "Blanc",
    },
    {
      name: "Voleur",
      order: 2,
      description:
        "Le Voleur peut choisir de voler un personnage, sauf l'Assassin ; lorsque le joueur dévoile son personnage, il donne ses pièces d'or au Voleur. Ceci se fait avant la perception par le joueur de ses pièces d'or du tour.",
      color: "Blanc",
    },
    {
      name: "Magicien",
      order: 3,
      description:
        "Le Magicien peut échanger toute sa main (ses cartes « quartier ») contre la main d'un autre joueur ou échanger autant de cartes qu'il le veut de sa main avec la pioche.",
      color: "Blanc",
    },
    {
      name: "Roi",
      order: 4,
      description:
        "Le Roi est le premier à choisir son personnage à partir du tour suivant. Chaque quartier « noble » lui rapporte 1 pièce d'or.",
      color: "Jaune",
    },
    {
      name: "Évêque",
      order: 5,
      description:
        "Les quartiers de l'Évêque ne peuvent pas être détruits par le Condottière. Chaque quartier « religieux » lui rapporte 1 pièce d'or.",
      color: "Bleu",
    },
    {
      name: "Marchand",
      order: 6,
      description:
        "Le Marchand perçoit d'office 1 pièce d'or, en plus de sa perception du tour. Chaque quartier « commerçant » lui rapporte 1 pièce d'or.",
      color: "Vert",
    },
    {
      name: "Architecte",
      order: 7,
      description:
        "L'Architecte pioche d'office 2 cartes, en plus de sa perception du tour, et il peut construire jusqu'à 3 quartiers par tour.",
      color: "Blanc",
    },
    {
      name: "Condottiere",
      order: 8,
      description:
        "Le Condottiere peut détruire un quartier (éventuellement un des siens) en dépensant sa valeur moins 1 pièce d'or. Il peut donc détruire « gratuitement » un quartier coûtant 1 pièce d'or. Il ne peut détruire un quartier d'une citadelle déjà terminée (huit cartes posées devant le joueur). Chaque quartier « militaire » lui rapporte 1 pièce d'or.",
      color: "Rouge",
    },
  ];

  for (const role of roles) {
    await prisma.roleCard.create({
      data: {
        name: role.name,
        order: role.order,
        description: role.description,
      },
    });
  }

  for (const category of data.districts) {
    for (const card of category.cards) {
      await prisma.building.create({
        data: {
          name: card.name,
          cost: card.cost,
          color: category.color,
          description: card.description ? card.description : "",
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
