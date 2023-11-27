import { StyleSheet } from "react-native"

export default styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    paddingBottom: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    paddingHorizontal: 32,
    paddingVertical: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F709C'
  },
  nameText: {
    fontWeight: 'bold',
    fontSize: 25,
    color: '#fff',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  horizontalDivider: {
    height: 1.5,
    backgroundColor: '#D8D9DA',
    width: '100%'
  },
  verticalDivider: {
    width: 1.5,
    height: 40,
    backgroundColor: '#D8D9DA',
  },
  avatar: {
    backgroundColor: '#D8D9DA',
    marginBottom: 10
  },
  totalTimeContainer: {
    justifyContent: 'center',
    marginTop: 10
  },
  totalTimeText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15
  },
  descriptionContainer: {
    marginVertical: 20
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 22,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  },
  timeTextWrapper: {
    flex: 1,
    marginHorizontal: 12,
    paddingHorizontal: 10
  },
  timeTitleText: {
    color: '#fff',
    marginBottom: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    textAlign: 'center',
  },
  timeTitleCheckinText: {
    backgroundColor: '#186F65',
  },
  timeTitleCheckoutText: {
    backgroundColor: '#EE9322',
  },
  timeDescriptionText: {
    textAlign: 'center',
    fontWeight: '700'
  },
  locationText: {
    textAlign: 'center',
    fontWeight: '400'
  },
})