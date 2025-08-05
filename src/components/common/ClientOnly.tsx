// src/components/common/ClientOnly.tsx
import React, { type ReactNode, useState, useEffect } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that only renders its children on the client side
 * to prevent hydration mismatches when dealing with browser-specific APIs
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  fallback = null,
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;
