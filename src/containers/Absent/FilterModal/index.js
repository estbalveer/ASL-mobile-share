import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import ReactNativeModal from 'react-native-modal'
import styles from './styles'
import { Button, Chip } from 'react-native-paper'
import { Calendar } from 'react-native-calendars'
import moment from 'moment'
import DatePicker from 'react-native-date-picker'

const LOCATION = [
  {
    id: 'onsite',
    label: 'Onsite',
  },
  {
    id: 'offsite',
    label: 'Offsite',
  },
]

const ABSENT = [
  {
    id: 'checkin',
    label: 'Checkin',
  },
  {
    id: 'checkout',
    label: 'Checkout',
  },
]

const LATE = [
  {
    id: 'yes',
    label: 'Yes',
  },
  {
    id: 'no',
    label: 'No',
  },
]

const FilterModal = ({
  isOpen = false,
  onClose = () => null,
  onSubmit = () => null,
  filter = {},
}) => {

  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false)
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false)
  const [filterState, setFilterState] = useState(filter)

  const handlePress = (type, value) => {
    setFilterState((prev) => ({
      ...prev,
      [type]: getFilterValue(type, value) ? null : value
    }))
  }

  const getFilterValue = (type, value) => {
    return filterState[type] === value
  }

  const handleConfirmDatePicker = (type) => (value) => {
    setFilterState((prev) => ({
      ...prev,
      [type]: value
    }))
    setIsStartDatePickerOpen(false)
    setIsEndDatePickerOpen(false)
  }

  const handleSubmitFilter = () => {
    onSubmit(filterState)
    onClose()
  }

  const handleClose = () => {
    setFilterState(filter)
    onClose()
  }
  
  useEffect(() => {
    setFilterState(filter)
  }, [filter])

  return (
    <>
      <ReactNativeModal
        isVisible={isOpen}
        onBackdropPress={handleClose}
        style={{
        backdropColor: "#B4B3DB",
        backdropOpacity: 0.8,
        animationIn: "zoomInDown",
        animationOut: "zoomOutUp",
        animationInTiming: 600,
        animationOutTiming: 600,
        backdropTransitionInTiming: 600,
        backdropTransitionOutTiming: 600
        }}
    >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
              <Text style={styles.title}>Filter By:</Text>
          </View>
          <View style={[styles.horizontalDivider, { marginVertical: 8 }]} />
          <View style={styles.content}>
            <View style={styles.filterChipContainer}>
              <Text style={styles.label}>Absent:</Text>
              <View style={styles.chips}>
                {
                  ABSENT.map(item => (
                    <Chip style={styles.chip} mode="outlined" selected={getFilterValue('absent', item.id)} onPress={() => handlePress('absent', item.id)}>{item.label}</Chip>
                  ))
                }
              </View>
            </View>
            <View style={styles.filterChipContainer}>
              <Text style={styles.label}>Location Checkin:</Text>
              <View style={styles.chips}>
                {
                  LOCATION.map(item => (
                    <Chip style={styles.chip} mode="outlined" selected={getFilterValue('location_checkin', item.id)} onPress={() => handlePress('location_checkin', item.id)}>{item.label}</Chip>
                  ))
                }
              </View>
            </View>
            <View style={styles.filterChipContainer}>
              <Text style={styles.label}>Location Checkout:</Text>
              <View style={styles.chips}>
                {
                  LOCATION.map(item => (
                    <Chip style={styles.chip} mode="outlined" selected={getFilterValue('location_checkout', item.id)} onPress={() => handlePress('location_checkout', item.id)}>{item.label}</Chip>
                  ))
                }
              </View>
            </View>
            <View style={styles.filterChipContainer}>
              <Text style={styles.label}>Late:</Text>
              <View style={styles.chips}>
                {
                  LATE.map(item => (
                    <Chip style={styles.chip} mode="outlined" selected={getFilterValue('late', item.id)} onPress={() => handlePress('late', item.id)}>{item.label}</Chip>
                  ))
                }
              </View>
            </View>
            <View style={styles.filterChipContainer}>
              <Text style={styles.label}>Date Range:</Text>
              <View style={styles.chips}>
                <Chip style={styles.chip} icon="calendar" mode="outlined" onPress={() => setIsStartDatePickerOpen(true)}>
                  {filterState.start_date ? moment(filterState.start_date).locale('en').format('ll') : 'Start Date'}
                </Chip>
                <Text>-</Text>
                <Chip style={styles.chip} icon="calendar" mode="outlined" onPress={() => setIsEndDatePickerOpen(true)}>
                  {filterState.end_date ? moment(filterState.end_date).locale('en').format('ll') : 'End Date'}
                </Chip>
              </View>
            </View>
          </View>
          <View style={[styles.horizontalDivider, { marginVertical: 8 }]} />
          <View style={styles.footer}>
            <Button style={styles.button} mode="outlined" color="#004488" onPress={handleClose}>
              Cancel
            </Button>
            <Button style={styles.button} mode="contained" color="#004488" onPress={handleSubmitFilter}>
              Submit
            </Button>
          </View>
        </View>
      </ReactNativeModal>
      <View style={styles.calendarConntainer}>
        <DatePicker
          modal
          mode='date'
          date={filterState.start_date || new Date()}
          open={isStartDatePickerOpen}
          onConfirm={handleConfirmDatePicker('start_date')}
          onCancel={() => setIsStartDatePickerOpen(false)}
        />
        <DatePicker
          modal
          mode='date'
          date={filterState.end_date || new Date()}
          open={isEndDatePickerOpen}
          minimumDate={filterState.start_date}
          onConfirm={handleConfirmDatePicker('end_date')}
          onCancel={() => setIsEndDatePickerOpen(false)}
        />
      </View>
    </>
  )
}

export default FilterModal