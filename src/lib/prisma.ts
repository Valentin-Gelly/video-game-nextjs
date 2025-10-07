import { PrismaClient } from "@/generated/prisma";

declare global {
    var prismaGlobal: PrismaClient | undefined;
}

const prismaClient = globalThis.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prismaClient;
}

export const prisma = prismaClient;