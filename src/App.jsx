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
import LinkTreeBuilder from './components/linktree/linktree-builder'
import { ErrorBoundary, RouteError } from './components/error-boundary'
import SharedLinkTree from './components/linktree/shared-linktree'
import NotFoundPage from './pages/not-found'
import LinkTreeGallery from './components/linktree/linktree-gallery'
import { HelmetProvider } from 'react-helmet-async'
import ViewLinkTree from './components/linktree/view-linktree'
import TreeEdit from './components/linktree/tree-edit'
import RoomDashboard from './components/room/room-dashboard'
import RoomDetail from './components/room/room-detail'
import NotificationManager from './components/notification/notification'
import RoomInvitation from './components/room/accept-invitation'
import InvitedRooms from './components/room/invite-rooms'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/dashboard',
        element: (
          <ErrorBoundary>
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          </ErrorBoundary>
        ),
      },
      {
        path: '/:id',
        element: <RedirectLink />,
      },
      {
        path: '/auth',
        element: <Auth />,
      },
      {
        path: '/link/:id',
        element: (
          <ErrorBoundary>
            <RequireAuth>
              <Link />
            </RequireAuth>
          </ErrorBoundary>
        ),
      },
      {
        path: '/qr-code-generator',
        element: (
          <ErrorBoundary>
            <QRCodeGenerator />
          </ErrorBoundary>
        ),
      },
      {
        path: '/contact',
        element: <ContactPage />,
      },
      {
        path: '/link-expired',
        element: <LinkExpired />,
      },
      {
        path: '/link-tree',
        element: (
          <ErrorBoundary>
            <LinkTreeBuilder />
          </ErrorBoundary>
        ),
      },{
        path: '/share/:id',
        element: (
          <ErrorBoundary>
            <SharedLinkTree />
          </ErrorBoundary>
        ),
      },{
        path: '/not-found',
        element: (
            <NotFoundPage />
        ),
      },{
        path: '/link-tree-gallery',
        element: (
            <LinkTreeGallery />
        ),
      },
      {
        path: '/view/:id',
        element: (
          <ErrorBoundary>
            <ViewLinkTree />
          </ErrorBoundary>
        ),
      },
      {
        path:'/edit/:id',
        element:(
          <ErrorBoundary>
            <TreeEdit />
          </ErrorBoundary>
        )
      },
      {
        path:'/rooms',
        element:(
          <ErrorBoundary>
            <RequireAuth>
              <RoomDashboard />
            </RequireAuth>
          </ErrorBoundary>
        )
      },
      {
        path:'/room/:slug',
        element:(
          <ErrorBoundary>
            <RequireAuth>
              <RoomDetail />
            </RequireAuth>
          </ErrorBoundary>
        )
      },
      {
        path:'/notifications',
        element:(
          <NotificationManager/>
        )
      },
      {
        path:'/invitation/:roomId',
        element:(
          <ErrorBoundary>
            <RequireAuth>
              <RoomInvitation/>
            </RequireAuth>
          </ErrorBoundary>
        )
      },
      {
        path:'/joined-rooms',
        element:(
          <InvitedRooms/>
        )
      }
    ],
  },
])

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <UrlProvider>
          <RouterProvider router={router} />
        </UrlProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}


export default App