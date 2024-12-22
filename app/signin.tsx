import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Pdstyles } from '@/constants/Styles'

const Page = () => {
    const [countryCode, setCountryCode] = useState('+91')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 80 : 0;

    const onSignin = async () => {}

  return (
    <KeyboardAvoidingView
    style={{flex: 1}}
    // behavior='padding'
    // keyboardVerticalOffset={keyboardVerticalOffset}
    >
        <View style={Pdstyles.container}>
            <Text style={Pdstyles.header}>Welcome Back</Text>
            <Text style={Pdstyles.descriptionText}>Enter the phone number associated with your account</Text>
            {/* <View style={[Pdstyles.border]}> */}
            <View style={styles.inputContainer}>
                <TextInput
                 style={styles.input}
                 placeholder="Country code"
                //  placeholderTextColor={Colors.gray}
                 value={countryCode}
                />
                <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Mobile number"
            // placeholderTextColor={Colors.gray}
            keyboardType="numeric"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
            </View>
            {/* <View>
            <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            // placeholderTextColor={Colors.gray}
            // keyboardType="numeric"
            value={password}
            onChangeText={setPassword}
          />
            </View> */}
            {/* </View> */}

            <TouchableOpacity
            style={[
                Pdstyles.pillButton,
                phoneNumber !== '' ? styles.enabled : styles.disabled
            ]}
            >
                <Text style={Pdstyles.buttonText} >Continue</Text>
            </TouchableOpacity>



        </View>
    </KeyboardAvoidingView>
  )
}

export default Page

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 40,
        flexDirection: 'row',
      },
      input: {
        // backgroundColor: Colors.lightGray,
        padding: 20,
        borderRadius: 16,
        fontSize: 20,
        marginRight: 10,
      },
      enabled: {
        // backgroundColor: Colors.primary,
      },
      disabled: {
        // backgroundColor: Colors.primaryMuted,
      },
})