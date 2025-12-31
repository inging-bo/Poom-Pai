import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import './index.css'
import { routes } from "./router/router"

// 라우터 설정 (routes 배열은 router.tsx에서 관리)
const router = createBrowserRouter(routes);

// 렌더링
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)