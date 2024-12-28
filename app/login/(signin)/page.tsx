import { Metadata } from 'next';
import SignInViewPage from '../_components/signin-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default function LoginPage() {
  return <SignInViewPage />;
}
