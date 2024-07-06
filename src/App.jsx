import { useState } from 'react'

import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layouts/app-layout'
import LandingPage from './pages/landing'
import Dashboard from './pages/dashboard'
import RedirectLink from './pages/redirect-link'
import Auth from './pages/auth'
import Link from './pages/link'
import UrlProvider from './context'
import RequireAuth from './components/require-auth'
import QRCodeGenerator from './pages/qr-generator'
import ContactPage from './pages/contact'
import LinkExpired from './components/link-expired'

const router = createBrowserRouter(
  [
    {
      element:<AppLayout/>,
      children:[
        {
          path:'/',
          element:<LandingPage/>
        },
        {
          path:'/dashboard',
          element:<RequireAuth>
            <Dashboard/>
          </RequireAuth>
        },
        {
          path:'/:id',
          element:<RedirectLink/>
        },
        {
          path:'/auth',
          element:<Auth/>
        },
        {
          path:'/link/:id',
          element:<RequireAuth>
            <Link/>
          </RequireAuth>
        },
        {
          path:'/qr-code-generator',
          element:
            <QRCodeGenerator/>
    
        },
        {
          path:'/contact',
          element:
            <ContactPage/>
    
        },
        {
          path:'/link-expired',
          element:
            <LinkExpired/>
        },
      ]
    }
  ]
)
function App() {

  return <UrlProvider>
    <RouterProvider router={router}/>
  </UrlProvider> 
}

export default App
