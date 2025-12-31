import { useEffect, useState } from "react";

// Navigator에 standalone 속성이 있을 수 있음을 정의합니다.
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export function useMobileEnv() {
  const [status, setStatus] = useState({
    isIOS: false,
    isStandalone: false,
    isMobile: false
  });

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const nav = window.navigator as NavigatorStandalone;

    // 아이폰/아이패드 여부
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    // 홈 화면 추가(Standalone) 여부
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      nav.standalone === true;

    // 일반적인 모바일 브라우저 체크
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);

    setStatus({ isIOS, isStandalone, isMobile });
  }, []);

  return status;
}