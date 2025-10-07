import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "./api-client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Usar o apiClient para autenticar com o backend
          const authData = await apiClient.authenticate(
            credentials.email,
            credentials.password
          );

          if (authData.access_token && authData.user) {
            // Armazenar o token JWT do backend
            if (typeof window !== "undefined") {
              localStorage.setItem("cardapio_token", authData.access_token);
              // Cookie com expiração de 2 horas (7200 segundos)
              document.cookie = `cardapio_token=${authData.access_token}; path=/; max-age=7200; SameSite=Strict`;
            }

            return {
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.name,
              role: authData.user.role,
              storeSlug: authData.user.storeSlug,
              active: authData.user.active,
              accessToken: authData.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error("❌ NextAuth: Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 horas (7200 segundos)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.storeSlug = user.storeSlug;
        token.active = user.active;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.storeSlug = token.storeSlug;
        session.user.active = token.active;
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se a URL for relativa, adicionar baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Se a URL for do mesmo domínio, permitir
      else if (new URL(url).origin === baseUrl) return url;
      // Por padrão, redirecionar para home se não for uma URL específica
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/unauthorized",
    signOut: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  // Configuração para desenvolvimento
  debug: process.env.NODE_ENV === "development",
};
