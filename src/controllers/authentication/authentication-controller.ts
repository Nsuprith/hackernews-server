import { createHash } from "crypto";

import {
  LogInWtihUsernameAndPasswordError,
  SignUpWithUsernameAndPasswordError,
  type LogInWithUsernameAndPasswordResult,
  type SignUpWithUsernameAndPasswordResult,
} from "./authentication-types";
import { prisma } from "../../extras/prisma"; // Adjusted the path to match the correct location of prismaClient
import * as jwt from "jsonwebtoken";
import { jwtSecretKey } from "../../../environment"; 
export const signUpWithUsernameAndPassword = async (parameters: {
  username: string;
  password: string;
}): Promise<SignUpWithUsernameAndPasswordResult> => {
  const isUserExistingAlready = await checkIfUserExistsAlready({
    username: parameters.username,
  });

  if (isUserExistingAlready) {
    throw SignUpWithUsernameAndPasswordError.CONFLICTING_USERNAME;
  }

  const passwordHash = createPasswordHash({
    password: parameters.password,
  });

  const user = await prisma.user.create({
    data: {
      userName: parameters.username,
      password: passwordHash,
    },
  });

  const token = createJWToken({
    id: user.id,
    username: user.userName,
  });

  const result: SignUpWithUsernameAndPasswordResult = {
    token,
    user,
  };

  return result;
};

export const logInWithUsernameAndPassword = async (parameters: {
  username: string;
  password: string;
}): Promise<LogInWithUsernameAndPasswordResult> => {
  // 1. Create the password hash
  const passwordHash = createPasswordHash({
    password: parameters.password,
  });

  // 2. Find the user with the username and password hash
  const user = await prisma.user.findUnique({
    where: {
      userName: parameters.username,
      password: passwordHash,
    },
  });

  // 3. If the user is not found, throw an error
  if (!user) {
    throw LogInWtihUsernameAndPasswordError.INCORRECT_USERNAME_OR_PASSWORD;
  }

  // 4. If the user is found, create a JWT token and return it
  const token = createJWToken({
    id: user.id,
    username: user.userName,
  });

  return {
    token,
    user,
  };
};

const createJWToken = (parameters: { id: string; username: string }): string => {
  // Generate token
  const jwtPayload: jwt.JwtPayload = {
    iss: "https://purpleshorts.co.in",
    sub: parameters.id,
    username: parameters.username,
  };

  const token = jwt.sign(jwtPayload, jwtSecretKey, {
    expiresIn: "30d",
  });

  return token;
};

const checkIfUserExistsAlready = async (parameters: { username: string }): Promise<boolean> => {
  const existingUser = await prisma.user.findUnique({
    where: {
      userName: parameters.username,
    },
  });

  if (existingUser) {
    return true;
  }

  return false;
};

const createPasswordHash = (parameters: { password: string }): string => {
  return createHash("sha256").update(parameters.password).digest("hex");
};