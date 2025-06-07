import { useSession } from 'next-auth/react';

const { data: session } = useSession();

if (session) {
  console.log(session.user); // contiene email, nombre, imagen, etc.
}
