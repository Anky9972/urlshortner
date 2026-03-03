import Footer from '@/components/footer'
import Header from '@/components/header'
import { Outlet, useLocation } from 'react-router-dom'
import useGoogleAnalytics from '@/hooks/use-googleanalytics'
import { useLenis } from '@/hooks/use-lenis'
import { Toaster } from 'sonner'
import { UrlState } from '@/context'
import EmailVerificationBanner from '@/components/email-verification-banner'
import OnboardingTour from '@/components/onboarding-tour'
import { useEffect } from 'react'

export const AppLayout = () => {
  useGoogleAnalytics();
  useLenis();
  const { user } = UrlState();
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div>
        <main className='min-h-screen'>
            <Header/>
            {user && (
              <EmailVerificationBanner
                emailVerified={user.emailVerified}
                email={user.email}
              />
            )}
            <Outlet/>
        </main>
        <Toaster position='top-center'/>
        <OnboardingTour />
        <Footer/>
    </div>
  )
}

export default AppLayout;
