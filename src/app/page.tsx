import { cookies } from 'next/headers';

import { HomeClient } from './HomeClient';

export default function HomePage() {
  const cookieStore = cookies();
  const isAuthenticated = Boolean(cookieStore.get('token')?.value);

  return <HomeClient isAuthenticated={isAuthenticated} />;
}
