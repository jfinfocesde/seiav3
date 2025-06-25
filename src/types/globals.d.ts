export {}

// Create a type for the roles
export type Roles = 'ADMIN' | 'TEACHER'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}