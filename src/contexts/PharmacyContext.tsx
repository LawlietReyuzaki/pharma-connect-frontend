import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface PharmacyInfo {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  owner_photo_path?: string;
  pharmacy_photo_path?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  operating_hours?: string;
  license_number?: string;
  theme_key: string;
  avg_rating: number;
  review_count: number;
  doctor_count: number;
  status: string;
  latitude?: number;
  longitude?: number;
}

interface PharmacyContextType {
  pharmacy: PharmacyInfo | null;
  selectPharmacy: (p: PharmacyInfo) => void;
  clearPharmacy: () => void;
}

const PharmacyContext = createContext<PharmacyContextType>({
  pharmacy: null,
  selectPharmacy: () => {},
  clearPharmacy: () => {},
});

export function PharmacyProvider({ children }: { children: ReactNode }) {
  const [pharmacy, setPharmacy] = useState<PharmacyInfo | null>(() => {
    try {
      const stored = sessionStorage.getItem("selected_pharmacy");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (pharmacy) {
      sessionStorage.setItem("selected_pharmacy", JSON.stringify(pharmacy));
    } else {
      sessionStorage.removeItem("selected_pharmacy");
    }
  }, [pharmacy]);

  const selectPharmacy = (p: PharmacyInfo) => setPharmacy(p);
  const clearPharmacy = () => setPharmacy(null);

  return (
    <PharmacyContext.Provider value={{ pharmacy, selectPharmacy, clearPharmacy }}>
      {children}
    </PharmacyContext.Provider>
  );
}

export const usePharmacy = () => useContext(PharmacyContext);
