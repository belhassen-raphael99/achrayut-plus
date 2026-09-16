import { useLocation, useNavigate } from 'react-router'

/** «חזרה»: לדף הקודם באתר, או ל־fallback כשנכנסו ישר לעמוד (קישור, רענון) */
export function useBackNavigation(fallback) {
  const navigate = useNavigate()
  const location = useLocation()
  return () => (location.key === 'default' ? navigate(fallback) : navigate(-1))
}
