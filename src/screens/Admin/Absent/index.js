import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, ScrollView, FlatList, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native'
import { Chip, TextInput } from 'react-native-paper';
import FeatherIcon from 'react-native-vector-icons/Feather'
import styles from './styles';
import axios from 'axios';
import { SERVER_URL } from '../../../common/config';
import AsyncStorage from '@react-native-community/async-storage';
import AbsentCard from '../../../containers/Absent/Card';
import AbsentModal from '../../../containers/Absent/AbsentModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FilterModal from '../../../containers/Absent/FilterModal';
import moment from 'moment';

const INITIAL_FILTER = {
  limit:20,
  offset:0,
  full_name:null,
  start_date:null,
  end_date:null,
  location_checkin: null,
  location_checkout: null,
  absent: null,
  late: null,
}

const AbsentScreen = (props) => {
  const [absentItems, setAbsentItems] = useState([]);
  const [absentPayload, setAbsentPayload] = useState({})
  const [searchValue, setSearchValue] = useState('')
  const [isFetchDataLoading, setIsFetchDataLoading] = useState(false)
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const [isAbsentModalOpen, setIsAbsentModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState({});
  const [filter, setFilter] = useState({
    ...INITIAL_FILTER
  })
  const [chips, setChips] = useState([]);

  const fetchData = async (filterParam) => {
    console.log(filterParam, 'filterParam')
    try {
      setIsFetchDataLoading(true)
      const company_id = await AsyncStorage.getItem('company_id')
      const { data } = await axios.post(`${SERVER_URL}getAllAbsent`, {
        ...(filterParam ? filterParam : filter),
        company_id,
      })
      setAbsentItems(data?.payload?.data);
      setAbsentPayload(data?.payload)
    } catch (error) {
      console.log(error)
    } finally {
      setIsFetchDataLoading(false)
    }
  }

  const handlePressCard = (item) => {
    setIsAbsentModalOpen(true)
    setSelectedData(item)
  };

  const handleCloseAbsentModal = () => {
    setIsAbsentModalOpen(false)
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false)
  };

  const handlePressFilter = () => {
    setIsFilterModalOpen(true)
  };

  const loadMore = async () => {
    try {
      if ((absentItems?.length < absentPayload?.total) && !isFetchDataLoading && !isLoadMoreLoading) {
        console.log('load moreeeeeeeeeeeeeee')
        setIsLoadMoreLoading(true)
        const filterParam = {
          ...filter,
          offset: filter.offset + filter.limit
        }
        setFilter({
          ...filterParam
        })
        const company_id = await AsyncStorage.getItem('company_id')
        const { data } = await axios.post(`${SERVER_URL}getAllAbsent`, {
          ...filterParam,
          company_id,
        })
        setAbsentItems((prev) => ([
          ...prev,
          ...data?.payload?.data
        ]));
        setAbsentPayload(data?.payload)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoadMoreLoading(false)
    }
  }

  const handleSearchInputChange = (value) => {
    setSearchValue(value);
  }

  const handleSearch = () => {
    const filterParam = {
      ...INITIAL_FILTER,
      full_name: searchValue
    }
    setFilter({
      ...filterParam,
    })
    fetchData(filterParam);
  }

  const handleRefresh = () => {
    setSearchValue('');
    setFilter({
      ...INITIAL_FILTER,
    })
    fetchData(INITIAL_FILTER);
  }

  const handleSubmitFilter = async (data) => {
    const filterParam = {
      ...filter,
      ...data,
      limit:20,
      offset:0,
    }
    await fetchData(filterParam);
    setFilter({
      ...filterParam,
    })
  };

  const handleRemoveFilter = async (key) => {
    const temp = {
      ...filter,
    }
    if (key === 'date_range') {
      temp.start_date = null
      temp.end_date = null
    } else {
      temp[key] = null
    }
    await fetchData(temp);
    setFilter({
      ...temp,
    })
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filter) {
      const temp = []
      if (filter.absent) {
        temp.push({
          id: 'absent',
          value: `Absent: ${filter.absent}`
        })
      }
      if (filter.location_checkin) {
        temp.push({
          id: 'location_checkin',
          value: `Location Checkin: ${filter.location_checkin}`
        })
      }
      if (filter.location_checkout) {
        temp.push({
          id: 'location_checkout',
          value: `Location Checkout: ${filter.location_checkout}`
        })
      }
      if (filter.late) {
        temp.push({
          id: 'late',
          value: `Late: ${filter.late}`
        })
      }
      if (filter.start_date && filter.end_date) {
        temp.push({
          id: 'date_range',
          value: `${moment(filter.start_date).locale('en').format('ll')} - ${moment(filter.end_date).locale('en').format('ll')}`
        })
      }
      setChips(temp)
    }
  }, [filter]);

  console.log(filter, 'filterrrrrr')

  if (isFetchDataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={48} color="gray" />
      </View>
    )
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}
    >
      <View style={styles.searchContainer}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            returnKeyType="search"
            placeholderTextColor="gray"
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            value={searchValue}
            onChangeText={handleSearchInputChange}
            onSubmitEditing={handleSearch}
            activeUnderlineColor="#536DFE"
            right={<TextInput.Icon name="magnify" size={28} />}
          />
        </View>
        <MaterialCommunityIcons onPress={handlePressFilter} name="filter-variant" style={styles.filter} size={32} color="#000" />
      </View>
      <View style={{ width: '100%' }}>
        <FlatList
          horizontal
          contentContainerStyle={styles.chips}
          data={chips}
          renderItem={({ item }) => (
            <Chip style={styles.chip} mode="outlined" onClose={() => handleRemoveFilter(item.id)}>
              {item.value}
            </Chip>
          )}
        />
      </View>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={isFetchDataLoading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{flexGrow: 1}}
        data={absentItems}
        renderItem={({ item }) => (
            <AbsentCard data={item} onPress={() => handlePressCard(item)} />
        )}
        ListFooterComponent={() => (
          isLoadMoreLoading && <ActivityIndicator size={24} color="gray" />
        )}
        onEndReachedThreshold={0.2}
        onEndReached={loadMore}
      />
      <AbsentModal
        isOpen={isAbsentModalOpen}
        onClose={handleCloseAbsentModal}
        data={selectedData}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        onSubmit={handleSubmitFilter}
        filter={filter}
      />
    </SafeAreaView>
  )
}

export default AbsentScreen;