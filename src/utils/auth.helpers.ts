import { prisma } from "./prisma";

const REFRESH_TOKEN_EXPIRATION = "7d"; // Long lived token for refreshing authentication

// Save session to database
export const saveSession = async (userId: string, token: string) => {
    await prisma.session.create({data: {userId: userId, token: token, expiresAt: new Date(Date.now() + parseInt(REFRESH_TOKEN_EXPIRATION) * 24 * 60 * 60 * 1000)}});
}

// Delete session from database
export const deleteSession = async (token: string) => {
    await prisma.session.deleteMany({where: {token: token}});
}