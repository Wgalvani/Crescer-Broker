import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { RequirePermission } from '@/features/auth/RequirePermission'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PreAvaliacaoOverviewPage } from '@/pages/pre-avaliacao/PreAvaliacaoOverviewPage'
import { ChapterPreAvaliacaoPage } from '@/pages/pre-avaliacao/ChapterPreAvaliacaoPage'
import { RodadasPage } from '@/pages/pre-avaliacao/RodadasPage'
import { PerformancePage } from '@/pages/programa/PerformancePage'
import { AnexosPage } from '@/pages/programa/AnexosPage'
import { ErrorPage, ForbiddenPage, NotFoundPage } from '@/pages/StatusPages'

export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/esqueci-senha', element: <ForgotPasswordPage /> },
          { path: '/redefinir-senha', element: <ResetPasswordPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/', element: <Navigate to="/dashboard" replace /> },
              { path: '/dashboard', element: <DashboardPage /> },
              {
                element: <RequirePermission perm="program.read" />,
                children: [
                  { path: '/programa/performance', element: <PerformancePage /> },
                  { path: '/programa/anexos', element: <AnexosPage /> },
                ],
              },
              {
                element: <RequirePermission perm="scoring.read_own" />,
                children: [
                  { path: '/pre-avaliacao', element: <PreAvaliacaoOverviewPage /> },
                  { path: '/pre-avaliacao/rodadas', element: <RodadasPage /> },
                  {
                    path: '/pre-avaliacao/excelencia',
                    element: (
                      <ChapterPreAvaliacaoPage
                        chapter="excelencia_operacional"
                        heading="Capítulo II · Excelência Operacional"
                      />
                    ),
                  },
                  {
                    path: '/pre-avaliacao/compliance',
                    element: (
                      <ChapterPreAvaliacaoPage
                        chapter="compliance"
                        heading="2.10 · Itens de Compliance"
                      />
                    ),
                  },
                ],
              },
            ],
          },
          { path: '/403', element: <ForbiddenPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
