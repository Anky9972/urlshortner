import Footer from '@/components/footer'
import Header from '@/components/header'
import { Outlet } from 'react-router-dom'
// import { Toaster } from "@/components/ui/toaster"
import useGoogleAnalytics from '@/hooks/use-googleanalytics'
import { Toaster } from 'sonner'
export  const AppLayout = () => {
  useGoogleAnalytics();

  return (
    <div>
        <main className=' min-h-screen'>
            <Header/>
            <Outlet/>
        </main>
        {/* <Toaster/> */}
        <Toaster position='top-center'/>
        <Footer/>
    </div>
  )
}

export default AppLayout;
