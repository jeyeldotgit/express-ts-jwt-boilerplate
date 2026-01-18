import { Request, Response } from 'express';

export const exampleController = {
  getExample: (req: Request, res: Response): void => {
    res.status(200).json({
      message: 'Example controller is working!',
      timestamp: new Date().toISOString(),
    });
  },
};

import { prisma } from "../utils/prisma";
import { User } from '../generated/prisma/client';

interface CreateUserPayload {
  email: string;
  password: string;
}

const createUser = async (payload: CreateUserPayload): Promise<User | null> => {
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password: payload.password,
    },
  });
  return user;
};

export const testPrismaController = async (req: Request, res: Response): Promise<void> => {
  const user = await createUser({
    email: "test@test.com",
    password: "test",
  });
  res.status(200).json(user);
};
