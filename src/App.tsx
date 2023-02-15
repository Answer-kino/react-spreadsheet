import React, { useLayoutEffect, useRef, useState } from "react"
import { cloneDeep } from "lodash"

type TextTitle = "title_1" | "title_2" | "title_3"
interface IText {
  [key: string]: string
  title_1: string
  title_2: string
  title_3: string
}
interface ITagType {
  type: "input" | "select"
  status: boolean
}
type TColTypes = {
  [key in TextTitle]: ITagType
}

function App() {
  const curSelect = useRef<HTMLSelectElement>(null)
  const curInput = useRef<HTMLInputElement>(null)

  const inputType: ITagType = { type: "input", status: false }
  const selectType: ITagType = { type: "select", status: false }
  const tableColType: TColTypes = { title_1: { ...inputType }, title_2: { ...selectType }, title_3: { ...inputType } }

  const tableTitle: TextTitle[] = ["title_1", "title_2", "title_3"]
  const tableRowValue: IText = { title_1: "1", title_2: "2", title_3: "3" }
  const [tableRowTypes, setTableRowTypes] = useState<TColTypes[]>([cloneDeep(tableColType)])
  const [tableRowTexts, setTableRowTexts] = useState<IText[]>([tableRowValue])

  const [curPoint, setCurPoint] = useState({ curRow: -1, curCol: -1 })

  const addRowsHandler = () => {
    setTableRowTexts((cur) => [...cur, cloneDeep(tableRowValue)])
    setTableRowTypes((cur) => [...cur, cloneDeep(tableColType)])
  }

  const doubleClickHandler = (rowNumber: number, colNumber: number) => {
    const { curRow, curCol } = curPoint
    const cloneTableRowTypes: TColTypes[] = cloneDeep(tableRowTypes)

    if (curRow !== -1 && curCol !== -1) cloneTableRowTypes[curRow][tableTitle[curCol]].status = false
    cloneTableRowTypes[rowNumber][tableTitle[colNumber]].status = true

    setTableRowTypes(cloneTableRowTypes)
    setCurPoint({ curRow: rowNumber, curCol: colNumber })
  }

  const keyDownHandler = (rowNumber: number, colNumber: number) => (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLSelectElement>) => {
    const key = e.key
    const ctrl = e.ctrlKey
    const enter = key === "Enter"
    const tab = key === "Tab"
    const right = ctrl && key === "ArrowRight"
    const left = ctrl && key === "ArrowLeft"
    const up = ctrl && key === "ArrowUp"
    const down = ctrl && key === "ArrowDown"

    const cloneTableRowTypes: TColTypes[] = cloneDeep(tableRowTypes)
    if (enter || tab || right || left || up || down) {
      let prevCol: number = colNumber
      let prevRow: number = rowNumber
      const nextCol = colNumber + 1 < tableTitle.length
      const nextRow = !nextCol && rowNumber + 1 < cloneTableRowTypes.length
      const isLast = !nextCol && !nextRow
      const rightCol = colNumber + 1 < tableTitle.length
      const leftCol = colNumber - 1 >= 0
      const upRow = rowNumber - 1 >= 0
      const downRow = rowNumber + 1 < cloneTableRowTypes.length
      if (enter) {
        prevCol = -1
        prevRow = -1
      }
      if (tab) {
        e.preventDefault()
        if (nextCol) {
          prevCol = colNumber + 1
        }
        if (nextRow) {
          prevRow = rowNumber + 1
          prevCol = 0
        }
        if (isLast) {
          prevCol = -1
          prevRow = -1
        }
      }
      if (right && rightCol) {
        prevCol = colNumber + 1
      }
      if (left && leftCol) {
        prevCol = colNumber - 1
      }
      if (up && upRow) {
        prevRow = rowNumber - 1
      }
      if (down && downRow) {
        prevRow = rowNumber + 1
      }
      cloneTableRowTypes[rowNumber][tableTitle[colNumber]].status = false
      if (prevCol > -1 && prevRow > -1) {
        cloneTableRowTypes[prevRow][tableTitle[prevCol]].status = true
      }
      setTableRowTypes(cloneTableRowTypes)
      setCurPoint({ curRow: prevRow, curCol: prevCol })
    }
  }

  const changeHandler = (rowNumber: number, colNumber: number) => (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const targetValue = e.target.value
    const cloneTableRowTexts: IText[] = cloneDeep(tableRowTexts)

    cloneTableRowTexts[rowNumber][tableTitle[colNumber]] = targetValue

    setTableRowTexts(cloneTableRowTexts)
  }

  useLayoutEffect(() => {
    if (curInput.current !== null) curInput.current.focus()
    else if (curSelect.current !== null) curSelect.current.focus()
  })

  const selectBulk = [1, 2, 3, 4]
  const selectBulkObj: { [key: string]: any[] } = { title_2: selectBulk }

  return (
    <div className="App">
      <button onClick={addRowsHandler}>Row 추가</button>
      <p>
        현재 경로 {curPoint.curRow}, {curPoint.curCol}
      </p>
      <table>
        <tbody>
          <tr>
            {tableTitle.map((title) => (
              <th>{title}</th>
            ))}
          </tr>

          {tableRowTexts.map((rowText, rowNumber) => {
            const rowKeys = Object.keys(rowText)
            return (
              <tr>
                {rowKeys.map((rowKey, colNumber) => {
                  const colType = tableRowTypes[rowNumber][tableTitle[colNumber]].type
                  const colStatus = tableRowTypes[rowNumber][tableTitle[colNumber]].status

                  return (
                    <td
                      onDoubleClick={() => {
                        doubleClickHandler(rowNumber, colNumber)
                      }}
                    >
                      {colStatus ? (
                        colType === "input" ? (
                          <input type="text" ref={curInput} onKeyDown={keyDownHandler(rowNumber, colNumber)} onChange={changeHandler(rowNumber, colNumber)} />
                        ) : (
                          <select ref={curSelect} onKeyDown={keyDownHandler(rowNumber, colNumber)} onChange={changeHandler(rowNumber, colNumber)}>
                            {selectBulkObj[tableTitle[colNumber]].map((item) => {
                              return <option value={item}>{item}</option>
                            })}
                          </select>
                        )
                      ) : (
                        <p>
                          {/* {rowNumber}{colNumber} */}
                          {tableRowTexts[rowNumber][tableTitle[colNumber]]}
                        </p>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default App
