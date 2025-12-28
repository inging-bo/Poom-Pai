import { type RouteObject } from "react-router-dom";
import SettlementDetail from "@/view/SettlementDetail.tsx";
import App from "@/App.tsx";
import Home from "@/view/Home.tsx";
import Error from "@/view/Error.tsx";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />, // App 컴포넌트가 최상위 레이아웃 역할을 합니다.
    children: [
      {
        index: true, // "/" 경로일 때
        element: <Home />,
      },
      {
        path: "money-details/:id",
        element: <SettlementDetail />,
      },
      {
        path: "*",
        element: <Error />,
      },
    ],
  },
];