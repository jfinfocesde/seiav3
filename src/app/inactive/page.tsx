import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function InactiveUserPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="max-w-md p-8 text-center bg-card rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-destructive mb-4">Usuario Inactivo</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Tu cuenta está pendiente de activación. Por favor, solicita acceso a un administrador para que te asigne un rol.
        </p>
        <div className="flex justify-center gap-4">
          <SignOutButton>
            <Button variant="destructive">Cerrar Sesión</Button>
          </SignOutButton>
          <Link href="/">
            <Button variant="outline">Volver al Inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 