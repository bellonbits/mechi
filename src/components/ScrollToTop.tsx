import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures that whenever the route changes, the window scrolls back to the top.
 * This prevents the "starting in the middle of the page" issue common in SPAs.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
