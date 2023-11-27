import AsyncStorage from '@react-native-community/async-storage'
import { Button } from 'native-base'
import React, { useEffect, useState } from 'react'
import { View, Image, Text, BackHandler } from 'react-native'
import RNModal from 'react-native-modal'

const PermissionAlert = () => {
    const [isOpen, setIsOpen] = useState(false)
    useEffect(() => {
        AsyncStorage.getItem('permission_is_checked')
            .then(value => {
                setIsOpen(!value)
            })
    }, [])

    const handleConfirm = async () => {
        await AsyncStorage.setItem('permission_is_checked', 'true')
        setIsOpen(false)
    }

    const handleClose = () => {
        BackHandler.exitApp()
    }

    return (
        <View>
            <RNModal
                isVisible={isOpen}
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
                <View style={{
                    paddingHorizontal: 18,
                    paddingVertical: 28,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fff'
                }}>
                    <Image
                        source={require('../assets/warning.png')}
                        style={{
                            width: 200,
                            height: 200
                        }} />
                    <View style={{
                        marginBottom: 18,
                    }}>
                        <Text style={{
                            marginBottom: 4
                        }}>
                            Scout Hippo collects location data to enable sales tracking even when the app is closed or not in use.
                        </Text>
                        <Text style={{
                            fontWeight: 'bold'
                        }}>
                            Are you sure you want to continue?
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row'
                        }}
                    >
                        <Button
                            onPress={handleConfirm}
                            style={{
                                paddingHorizontal: 20,
                                marginRight: 20,
                                borderRadius: 8
                            }}
                        >
                            <Text style={{
                                color: 'white'
                            }}>Yes</Text>
                        </Button>
                        <Button
                            onPress={handleClose}
                            style={{
                                paddingHorizontal: 20,
                                backgroundColor: 'gray',
                                borderRadius: 8
                            }}
                        >
                            <Text style={{
                                color: 'white'
                            }}>Exit</Text>
                        </Button>
                    </View>
                </View>
            </RNModal>
        </View>
    )
}

export default PermissionAlert