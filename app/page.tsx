import { redirect } from 'next/navigation';

// Deshabilitar prerenderizado
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  // Redirigir al login
  redirect('/login');
}
