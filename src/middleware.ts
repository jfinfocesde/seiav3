import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isTeacherRoute = createRouteMatcher(['/teacher(.*)']);
const isStudentRoute = createRouteMatcher(['/student(.*)']);
const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)']);
const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/teacher(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const { pathname } = req.nextUrl;
  
  // Si el usuario no está autenticado
  if (!userId) {
    // Permitir acceso a la página de inicio y a la de estudiantes (que manejará su propio flujo de "tomar evaluación")
    if (pathname === '/' || isStudentRoute(req) || isPublicRoute(req)) {
      return NextResponse.next();
    }
    // Para cualquier otra ruta, requerir autenticación
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Si el usuario está autenticado
  const userRole = sessionClaims?.metadata?.role;

  // Regla para usuarios sin rol
  if (!userRole || (userRole !== 'ADMIN' && userRole !== 'TEACHER')) {
    // Si intentan acceder a rutas protegidas o a la raíz (intentando entrar al sistema)
    // los mandamos a la página de inactivos.
    if (isProtectedRoute(req) || pathname === '/') {
       // Evitar bucle si ya están en la página de inactivos
       if (pathname !== '/inactive') {
         return NextResponse.redirect(new URL('/inactive', req.url));
       }
    }
    // Si no intentan acceder a rutas protegidas (p. ej. /student), los dejamos pasar.
    return NextResponse.next();
  }

  // A partir de aquí, el usuario TIENE rol (ADMIN o TEACHER)

  // Redirección desde la raíz según el rol
  if (pathname === '/') {
    if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin', req.url));
    if (userRole === 'TEACHER') return NextResponse.redirect(new URL('/teacher', req.url));
    }

  // Proteger rutas de admin
  if (isAdminRoute(req) && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/teacher', req.url)); // Un profesor no debe estar en /admin
  }

  // Proteger rutas de profesor (solo TEACHER y ADMIN pueden entrar)
  // Esta regla ya está implícita en la lógica anterior, pero se mantiene por claridad.
  // Un usuario sin rol ya fue manejado arriba.
  if (isTeacherRoute(req) && userRole !== 'TEACHER' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/inactive', req.url)); // No deberían llegar aquí, pero por si acaso.
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};