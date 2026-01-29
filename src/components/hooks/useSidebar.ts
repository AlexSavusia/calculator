import {useEffect, useMemo, useState} from "react";
export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMemo(() => window.matchMedia("(max-width: 991.98px)"), []);

  useEffect(() => {

    const apply = () => {
      const body = document.body;
      if (!isMobile.matches) {
        body.classList.toggle("sidebar-collapse", collapsed);
      } else {
        if (collapsed) {
          body.classList.toggle("sidebar-open", collapsed);
          body.classList.toggle("sidebar-closed", !collapsed);
        }
      }
    }
    apply();

    const handler = () => {
      document.body.classList.remove("sidebar-collapse");
      document.body.classList.remove("sidebar-open");
      document.body.classList.remove("sidebar-closed");
      apply()
    };
    isMobile.addEventListener?.("change", handler);

    return () => {
      isMobile.removeEventListener?.("change", handler);
      document.body.classList.remove("sidebar-collapse");
      document.body.classList.remove("sidebar-open");
    };
  }, [collapsed, isMobile]);

  return { collapsed, setCollapsed, toggle: () => setCollapsed(v => !v), isMobile: isMobile.matches };
}