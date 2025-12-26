import { type RouteObject } from "react-router-dom";
import App from "../App";
import Error from "../view/Error";
import Home from "../view/Home";
import MoneyDetails from "../view/MoneyDetails";

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
        element: <MoneyDetails />,
      },
      {
        path: "*",
        element: <Error />,
      },
    ],
  },
];