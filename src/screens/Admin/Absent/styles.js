import {StyleSheet} from 'react-native';
import {SCREEN_HEIGHT} from '../../../components/common/styles';

export default styles = StyleSheet.create({
  loadingContainer: {
    width: '100%',
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetContainer: {
    zIndex: 10,
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: 'center',
  },
  searchContainer: {
    width: '100%',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    borderRadius: 6,
    borderStyle: 'solid',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#d9d9d9',
    paddingLeft: 10,
    paddingRight: 10,
  },
  filter: {
    paddingHorizontal: 8,
  },
  chips: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  chip: {
    marginHorizontal: 4,
    borderWidth: 1,
    maxHeight: 30,
    backgroundColor: '#F1EFEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
