import Icon from '../../ui/Icon/Icon.jsx'
import { formatFileSize, isPdf } from '../../../utils/files.js'
import './InvoiceThumbnail.css'

/**
 * הקובץ שהועלה (N3–N5, N7, N9, N13): תמונה, או אייקון מסמך עם שם הקובץ וגודלו.
 * size: preview (רוחב מלא, N3) · md (מוקטן בראש המסך) · sm (שורה ליד פרטים)
 */
function InvoiceThumbnail({ file, url, size = 'md', alt = 'הקובץ שהועלה' }) {
  if (isPdf(file)) {
    return (
      <div className={`invoice-thumbnail invoice-thumbnail--file invoice-thumbnail--${size}`}>
        <Icon name="description" size="lg" />
        <span className="invoice-thumbnail__name">
          <bdi>{file.name}</bdi>
        </span>
        <span className="invoice-thumbnail__size">{formatFileSize(file.size)}</span>
      </div>
    )
  }

  return <img src={url} alt={alt} className={`invoice-thumbnail invoice-thumbnail--${size}`} />
}

export default InvoiceThumbnail
