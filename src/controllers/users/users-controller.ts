import { prisma } from "../../extras/prisma";
import { GetMeError, type GetAllUsersResult, type GetMeResult } from "./users-types";

export const getMe = async (parameters: { userId: string }): Promise<GetMeResult> => {
  const user = await prisma.user.findUnique({
    where: {
      id: parameters.userId,
    },
  });

  if (!user) {
    throw GetMeError.BAD_REQUEST;
  }

  return {
    user,
  };
};

export const getAllUsers = async (): Promise<GetAllUsersResult> => {
  const users = await prisma.user.findMany();

  return {
    users,
  };
};