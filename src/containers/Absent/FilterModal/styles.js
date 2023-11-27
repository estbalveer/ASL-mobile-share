import { StyleSheet } from "react-native"

export default styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    justifyContent: 'center'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16
  },
  content: {
    
  },
  horizontalDivider: {
    height: 1.5,
    backgroundColor: '#D8D9DA',
    width: '100%'
  },
  filterChipContainer: {
    marginBottom: 10
  },
  chips: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  chip: {
    marginHorizontal: 4,
    borderWidth: 1
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 4,
  },
  button: {
    borderWidth: 1,
    marginLeft: 8
  },
  label: {
    fontWeight: '700'
  },
  calendarConntainer: {
    zIndex: 100
  }
})