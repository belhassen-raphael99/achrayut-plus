import Skeleton from '../../ui/Skeleton/Skeleton.jsx'
import ApplianceListSkeleton from '../ApplianceListSkeleton/ApplianceListSkeleton.jsx'
import '../UrgentCard/UrgentCard.css'
import './DashboardSkeleton.css'

/** שלד הדשבורד בזמן טעינה (D5): אותה צורה כמו הכרטיס והשורות, בלי ספינר ובלי הבהוב */
function DashboardSkeleton() {
  return (
    <>
      <div className="urgent-card" aria-hidden="true">
        <Skeleton size="title" width="sm" />
        <Skeleton size="title" width="md" />
        <Skeleton width="lg" />
        <Skeleton width="md" />
      </div>
      <div className="dashboard-skeleton__section" aria-hidden="true">
        <Skeleton size="title" width="sm" />
        <ApplianceListSkeleton rows={3} />
      </div>
    </>
  )
}

export default DashboardSkeleton
