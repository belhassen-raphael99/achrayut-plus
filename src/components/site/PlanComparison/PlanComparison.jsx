import { Check, Minus } from '@phosphor-icons/react'
import { planComparison } from '../../../data/site.js'
import './PlanComparison.css'

/** טבלת השוואה בין התוכניות. במובייל גוללת לרוחב בתוך האזור, לא הדף כולו */
function PlanComparison({ titleId }) {
  const { columns, rows } = planComparison

  return (
    <div className="plan-comparison" role="region" aria-labelledby={titleId} tabIndex={0}>
      <table className="plan-comparison__table">
        <thead>
          <tr>
            <th scope="col">תכונה</th>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.values.map((value, index) => (
                <td key={columns[index]}>
                  <ComparisonValue value={value} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ComparisonValue({ value }) {
  if (value === true) {
    return (
      <>
        <Check weight="duotone" className="plan-comparison__yes" aria-hidden="true" />
        <span className="visually-hidden">כלול</span>
      </>
    )
  }

  if (value === false) {
    return (
      <>
        <Minus weight="duotone" className="plan-comparison__no" aria-hidden="true" />
        <span className="visually-hidden">לא כלול</span>
      </>
    )
  }

  return value
}

export default PlanComparison
