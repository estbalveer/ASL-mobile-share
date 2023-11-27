import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Avatar } from 'react-native-paper'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { getInitials } from '../../../utils/string'
import moment from 'moment'

const AbsentCard = ({
  onPress = () => null,
  data
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1EFEF',
        padding: 14
      }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Avatar.Text
              style={{
                backgroundColor: '#F1EFEF',
                marginRight: 8
              }}
              size={24}
              label={getInitials(data?.full_name)}
            />
            <Text>{data?.full_name}</Text>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            {
            data?.check_out_datetime || data?.check_in_datetime ? (
              <Text style={{
                fontSize: 14,
                color: '#fff',
                paddingHorizontal: 4,
                paddingVertical: 2,
                backgroundColor: data?.check_out_datetime ? '#EE9322' : '#186F65',
                borderRadius: 6,
                marginRight: 8
              }}>
                {data?.check_out_datetime ? 'Checkout' : 'Checkin'}
              </Text>
              ) : null
            }
            <Text style={{
              fontSize: 14,
              color: '#6D7588',
              marginRight: 12
            }}>
              {data?.check_in_datetime ? moment(data?.check_out_datetime || data?.check_in_datetime).format('HH:mm') : '-'}
            </Text>
            <FeatherIcon name="chevron-right" size={18} color="#000" />
          </View>
      </View>
    </TouchableOpacity>
  )
}

export default AbsentCard