import { useState, useEffect } from 'react';

export function useDeviceType() {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDevice = () => {
      // User Agent 검사 (가장 확실한 기기 정보)
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(ua);

      // 터치 지원 여부 검사
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // 둘 중 하나라도 해당하면 모바일 환경으로 간주
      if (isMobileUA || hasTouch) {
        setDevice('mobile');
      } else {
        setDevice('desktop');
      }
    };

    checkDevice();
  }, []);

  return {
    isMobile: device === 'mobile',
    isDesktop: device === 'desktop',
  };
}