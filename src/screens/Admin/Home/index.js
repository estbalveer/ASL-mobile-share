import React from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'

const HomeScreen = (props) => {
  return (
    <View>
        <Text>
            HomeScreen
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

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);