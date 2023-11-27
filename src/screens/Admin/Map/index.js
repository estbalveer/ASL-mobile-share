import React from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'

const MapScreen = (props) => {
  return (
    <View>
        <Text>
            MapScreen
        </Text>
    </View>
  )
}

const mapStateToProps = state => {
    return {}
}

const mapDispatchToProps = dispatch => {
    return {
        // userActions: bindActionCreators(userActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);