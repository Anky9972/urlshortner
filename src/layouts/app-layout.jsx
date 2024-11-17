import Footer from '@/components/footer'
import Header from '@/components/header'
import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
export  const AppLayout = () => {
  return (
    <div>
        <main className=' min-h-screen container'>
            <Header/>
            <Outlet/>
        </main>
        <Toaster/>
        <Footer/>
    </div>
  )
}

export default AppLayout;
