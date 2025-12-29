import KeyboardShortcut from '@/components/display/KeyboardShortcut'
import { KeyboardActionName } from '@/constants/keyboard'
import useDateView from '@/hooks/facets/useDateView'
import { useFilteredJournalEntries } from '@/hooks/queries/useFilteredJournalEntries'
import useKeyboardAction from '@/hooks/useKeyboardAction'
import { JournalEntry } from '@/schema/documents/JournalEntry'
import { DateViewVariant } from '@/schema/support/search/facet'
import { getAbsoluteDateRangeFromDateView, getEmpiracleDateRangeFromJournalEntries } from '@/utils/date'
import { ArrowBack, ArrowDropDown, ArrowForward, CalendarToday } from '@mui/icons-material'
import {
  Button,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useCallback, useMemo, useRef, useState } from 'react'

const SELECTABLE_DATE_VIEWS = [DateViewVariant.WEEKLY, DateViewVariant.MONTHLY, DateViewVariant.ANNUAL]

const dateViewMenuOptionLabels: Partial<Record<DateViewVariant, string>> = {
  [DateViewVariant.WEEKLY]: 'Week',
  [DateViewVariant.MONTHLY]: 'Month',
  [DateViewVariant.ANNUAL]: 'Year',
  [DateViewVariant.CUSTOM]: 'Date Range',
}

type JournalEditorDateViewVariantWithKeystroke = Exclude<
  DateViewVariant,
  DateViewVariant.DAILY | DateViewVariant.FISCAL | DateViewVariant.CUSTOM
>

const dateViewKeystrokes: Record<JournalEditorDateViewVariantWithKeystroke, KeyboardActionName> = {
  [DateViewVariant.WEEKLY]: KeyboardActionName.DATE_VIEW_WEEKLY,
  [DateViewVariant.MONTHLY]: KeyboardActionName.DATE_VIEW_MONTHLY,
  [DateViewVariant.ANNUAL]: KeyboardActionName.DATE_VIEW_ANNUALLY,
}

const DATE_RANGE_SEPERATOR = '\u00A0\u2013\u00A0'

export default function JournalDateActions() {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  const [showDateViewPicker, setShowDateViewPicker] = useState<boolean>(false)

  const { dateView, startDate, changeDateView, changeStartDate } = useDateView()

  const datePickerButtonRef = useRef<HTMLButtonElement | null>(null)
  const dateViewPickerButtonRef = useRef<HTMLButtonElement | null>(null)
  const hideTodayButton = dateView.view === DateViewVariant.CUSTOM

  const getJournalEntriesQuery = useFilteredJournalEntries()

  const theme = useTheme()

  const hideDateViewPicker = useMediaQuery(theme.breakpoints.down('md'))
  const hideNextPrevButtons = hideTodayButton || hideDateViewPicker
  const headingSize = useMediaQuery(theme.breakpoints.down('sm')) ? 'h6' : 'h5'

  const now = useMemo(() => dayjs(), [])

  useKeyboardAction(KeyboardActionName.DATE_VIEW_ANNUALLY, () => {
    changeDateView(DateViewVariant.ANNUAL)
  })
  useKeyboardAction(KeyboardActionName.DATE_VIEW_MONTHLY, () => {
    changeDateView(DateViewVariant.MONTHLY)
  })
  useKeyboardAction(KeyboardActionName.DATE_VIEW_WEEKLY, () => {
    changeDateView(DateViewVariant.WEEKLY)
  })
  useKeyboardAction(KeyboardActionName.JUMP_TO_TODAY_VIEW, () => {
    jumpToToday()
  })

  const [prevButtonTooltip, nextButtonTooltip] = useMemo(() => {
    if (dateView.view === DateViewVariant.MONTHLY) {
      return ['Previous month', 'Next month']
    } else if (dateView.view === DateViewVariant.ANNUAL) {
      return ['Previous year', 'Next year']
    } else if (dateView.view === DateViewVariant.WEEKLY) {
      return ['Previous week', 'Next week']
    } else {
      return [undefined, undefined]
    }
  }, [dateView])

  /**
   * Supported formats include:
   *
   * @example "2024" // Year view
   * @example "September" // Monthly view, in current year
   * @example "Dec 2024" // Monthly view, in past/future year
   * @example "Jan 1 - 7" // Weekly view in current year
   * @example "Sep 1 - 7, 2022" // Weekly view in past year
   * @example "Dec 31, 2023 - Jan 6, 2024" // Weekly view spanning multiple past/future years
   * @example "Jan 30 - Sep 2" // Date range in current year
   * @example "Jan 5 - Feb 3, 2021" // Date range in past/future year
   * @example "Nov 2020 - Feb 2021" // Date range spanning multiple years
   */
  const formattedDateString = useMemo(() => {
    let { startDate, endDate } = getAbsoluteDateRangeFromDateView(dateView)

    // Handle case where an incomplete range is given
    if (!startDate || !endDate) {
      const journalEntries: JournalEntry[] = Object.values(getJournalEntriesQuery.data ?? {})
      const { startDate: empiracleStartDate, endDate: empiracleEndDate } =
        getEmpiracleDateRangeFromJournalEntries(journalEntries)
      if (empiracleStartDate && empiracleEndDate) {
        startDate = empiracleStartDate
        endDate = empiracleEndDate
      }
      if (!startDate || !endDate) {
        const date = startDate ?? endDate
        if (!date) {
          return dayjs(now).format('MMM D')
        }

        if (dayjs(date).isSame(now, 'year')) {
          return dayjs(date).format('MMM D')
        } else {
          return dayjs(date).format('MMM D, YYYY')
        }
      }
    }

    if (dateView.view === DateViewVariant.ANNUAL) {
      return String(dateView.year)
    }

    const spansCurrentYear = startDate.isSame(now, 'year') && endDate.isSame(now, 'year')
    const spansSingleYear = startDate.isSame(endDate, 'year')
    const spansSingleMonth = startDate.isSame(endDate, 'month')

    if (dateView.view === DateViewVariant.MONTHLY) {
      if (spansCurrentYear) {
        return startDate.format('MMMM')
      }
      return startDate.format('MMM YYYY')
    }

    if (spansSingleYear) {
      const endFormat = spansCurrentYear ? 'D' : 'D, YYYY'

      if (spansSingleMonth) {
        return [startDate.format('MMM D'), endDate.format(endFormat)].join(DATE_RANGE_SEPERATOR)
      }

      return [startDate.format('MMM D'), endDate.format(`MMM ${endFormat}`)].join(DATE_RANGE_SEPERATOR)
    }

    const format = dateView.view === DateViewVariant.WEEKLY ? 'MMM D, YYYY' : 'MMM YYYY'
    return [startDate.format(format), endDate.format(format)].join(DATE_RANGE_SEPERATOR)
  }, [dateView, getJournalEntriesQuery.data])

  // const calendarAvailableViews = useMemo((): DateView[] => {
  // 	switch (journalSliceContext.view) {
  // 		case 'year':
  // 			return ['year']
  // 		case 'week':
  // 			return ['year', 'month', 'day']
  // 		case 'month':
  // 		default:
  // 			return ['month', 'year']
  // 	}
  // }, [journalSliceContext.view])

  const formattedCurrentDay = useMemo(() => {
    return now.format('dddd, MMMM D')
  }, [])

  // const handleChangeDatePickerDate = (value: dayjs.Dayjs) => {
  // 	journalSliceContext.setDate(value.format('YYYY-MM-DD'))
  // }

  const handlePrevPage = () => {
    if (dateView.view === DateViewVariant.CUSTOM) {
      return
    }

    if (dateView.view === DateViewVariant.MONTHLY) {
      changeStartDate(startDate.subtract(1, 'month'))
    } else if (dateView.view === DateViewVariant.WEEKLY) {
      changeStartDate(startDate.subtract(1, 'week'))
    } else if (dateView.view === DateViewVariant.ANNUAL) {
      changeStartDate(startDate.subtract(1, 'year'))
    }
  }

  const handleNextPage = () => {
    if (dateView.view === DateViewVariant.CUSTOM) {
      return
    }

    if (dateView.view === DateViewVariant.MONTHLY) {
      console.log('current start date:', startDate)
      changeStartDate(startDate.add(1, 'month'))
    } else if (dateView.view === DateViewVariant.WEEKLY) {
      changeStartDate(startDate.add(1, 'week'))
    } else if (dateView.view === DateViewVariant.ANNUAL) {
      changeStartDate(startDate.add(1, 'year'))
    }
  }

  const handleChangeDateView = (view: DateViewVariant) => {
    setShowDateViewPicker(false)
    changeDateView(view)
  }

  const jumpToToday = useCallback(() => {
    changeStartDate(null)
  }, [dateView])

  return (
    <>
      <Menu
        open={showDateViewPicker}
        anchorEl={dateViewPickerButtonRef.current}
        onClose={() => setShowDateViewPicker(false)}>
        {Object.entries(dateViewMenuOptionLabels)
          .filter(([key]) => {
            return dateView.view === key || SELECTABLE_DATE_VIEWS.includes(key as DateViewVariant)
          })
          .map(([key, label]) => {
            return (
              <MenuItem
                key={key}
                onClick={() => handleChangeDateView(key as DateViewVariant)}
                aria-label={`View by ${label}`}
                selected={key === dateView.view}>
                <ListItemText>{label}</ListItemText>
                {dateViewKeystrokes[key as JournalEditorDateViewVariantWithKeystroke] && (
                  <KeyboardShortcut
                    name={dateViewKeystrokes[key as JournalEditorDateViewVariantWithKeystroke]}
                    sx={{ ml: 2 }}
                  />
                )}
              </MenuItem>
            )
          })}
      </Menu>
      <Popover open={showDatePicker} onClose={() => setShowDatePicker(false)} anchorEl={datePickerButtonRef.current}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
          // views={calendarAvailableViews}
          // onChange={(value) => {
          //     // handleChangeDatePickerDate(value)
          // }}
          />
        </LocalizationProvider>
      </Popover>
      <Stack direction="row" alignItems="center" gap={1}>
        {!hideDateViewPicker && (
          <Button
            variant="text"
            sx={(theme) => ({
              py: 0.75,
              backgroundColor: theme.palette.action.hover,
              '&:hover': {
                backgroundColor: theme.palette.action.selected,
              },
            })}
            ref={dateViewPickerButtonRef}
            onClick={() => setShowDateViewPicker((showing) => !showing)}
            color="inherit"
            endIcon={<ArrowDropDown />}>
            <Typography>{dateViewMenuOptionLabels[dateView.view]}</Typography>
          </Button>
        )}
        {!hideTodayButton && (
          <Tooltip title={formattedCurrentDay}>
            <IconButton color="inherit" onClick={() => jumpToToday()}>
              <CalendarToday />
            </IconButton>
          </Tooltip>
        )}
        <Button
          color="inherit"
          endIcon={<ArrowDropDown />}
          ref={datePickerButtonRef}
          onClick={() => setShowDatePicker((showing) => !showing)}>
          <Typography variant={headingSize} sx={{ fontWeight: 500 }}>
            {formattedDateString}
          </Typography>
        </Button>
        {!hideNextPrevButtons && (
          <Stack direction="row">
            <Tooltip title={prevButtonTooltip}>
              <IconButton onClick={() => handlePrevPage()}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Tooltip title={nextButtonTooltip}>
              <IconButton onClick={() => handleNextPage()}>
                <ArrowForward />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </>
  )
}
