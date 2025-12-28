import { useState, useEffect } from 'react';

// Navigator 인터페이스에 iOS 전용 속성 추가
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function useMobileEnv() {
  const [safeValue, setSafeValue] = useState(0);

  useEffect(() => {
    // 1. 일반적인 Standalone 모드 확인 (Android, 최신 iOS)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    // 2. iOS 전용 속성 확인
    const nav = window.navigator as NavigatorWithStandalone;
    const isIOSStandalone = nav.standalone === true;

    // 둘 중 하나라도 해당되면 1(Standalone), 아니면 0(Browser)
    setSafeValue(isStandaloneMode || isIOSStandalone ? 1 : 0);
  }, []);

  return safeValue;
}