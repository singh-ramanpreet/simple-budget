import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import MonthNavigator from "./month-navigator"

function renderNavigator(month = 3, year = 2026) {
  const onNavigate = mock((_delta: number) => {})
  const onJump = mock((_month: number, _year: number) => {})
  const user = userEvent.setup()
  const view = render(<MonthNavigator month={month} year={year} onNavigate={onNavigate} onJump={onJump} />)

  /** The previous/next arrows are the only clickable SVGs in the navigator */
  const arrows = () => view.container.querySelectorAll<SVGElement>("svg.cursor-pointer")

  return {
    ...view,
    user,
    onNavigate,
    onJump,
    prevArrow: () => arrows()[0],
    nextArrow: () => arrows()[arrows().length - 1],
    yearInput: () => screen.getByRole("spinbutton"),
  }
}

describe("MonthNavigator", () => {
  test("shows the selected month and year", () => {
    const { yearInput } = renderNavigator(3, 2026)

    expect(screen.getByRole("combobox")).toHaveTextContent("March")
    expect(yearInput()).toHaveValue(2026)
  })

  test("arrows navigate one month backwards and forwards", async () => {
    const { user, onNavigate, prevArrow, nextArrow } = renderNavigator()

    await user.click(prevArrow())
    expect(onNavigate).toHaveBeenLastCalledWith(-1)

    await user.click(nextArrow())
    expect(onNavigate).toHaveBeenLastCalledWith(1)
    expect(onNavigate).toHaveBeenCalledTimes(2)
  })

  test("picking a month from the dropdown jumps to it in the same year", async () => {
    const { user, onJump } = renderNavigator(3, 2026)

    await user.click(screen.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "June" }))

    expect(onJump).toHaveBeenCalledWith(6, 2026)
  })

  test("typing a year and pressing Enter jumps to that year", async () => {
    const { user, onJump, yearInput } = renderNavigator(3, 2026)

    await user.clear(yearInput())
    await user.type(yearInput(), "2024{Enter}")

    expect(onJump).toHaveBeenCalledWith(3, 2024)
  })

  test("leaving the year field commits the typed year", async () => {
    const { user, onJump, yearInput } = renderNavigator(3, 2026)

    await user.clear(yearInput())
    await user.type(yearInput(), "2025")
    expect(onJump).not.toHaveBeenCalled()

    await user.tab()
    expect(onJump).toHaveBeenCalledWith(3, 2025)
  })

  test("an out-of-range year is discarded and the field reverts", async () => {
    const { user, onJump, yearInput } = renderNavigator(3, 2026)

    await user.clear(yearInput())
    await user.type(yearInput(), "99{Enter}")

    expect(onJump).not.toHaveBeenCalled()
    expect(yearInput()).toHaveValue(2026)
  })

  test("the year field follows external year changes", () => {
    const { rerender, onNavigate, onJump, yearInput } = renderNavigator(3, 2026)

    rerender(<MonthNavigator month={3} year={2030} onNavigate={onNavigate} onJump={onJump} />)

    expect(yearInput()).toHaveValue(2030)
  })
})
