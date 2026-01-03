import { useState } from "react";

export const useTab = (initialTab: number = 0) => {
  const [tab, setTab] = useState(initialTab);

  // 필요하다면 탭 변경 시 실행할 추가 로직을 여기 넣을 수 있습니다.
  const changeTab = (newTab: number) => {
    setTab(newTab);
  };

  return { tab, setTab: changeTab };
};