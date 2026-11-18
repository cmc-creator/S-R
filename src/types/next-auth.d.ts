import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    passwordVersion?: string;
    role: Role;
    title?: string;
    unit?: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      title?: string;
      unit?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    passwordVersion?: string;
    id: string;
    role: Role;
    title?: string;
    unit?: string;
  }
}
