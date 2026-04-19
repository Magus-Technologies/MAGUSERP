import { Redirect } from 'expo-router';

// El punto de entrada siempre va al splash
export default function Index() {
  return <Redirect href="/splash" />;
}
