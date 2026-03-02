import Footer from '@/components/footer'
import Header from '@/components/header'
import { Outlet } from 'react-router-dom'
import useGoogleAnalytics from '@/hooks/use-googleanalytics'
import { Toaster } from 'sonner'
import { UrlState } from '@/context'
import EmailVerificationBanner from '@/components/email-verification-banner'
import OnboardingTour from '@/components/onboarding-tour'

export const AppLayout = () => {
  useGoogleAnalytics();
  const { user } = UrlState();

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
