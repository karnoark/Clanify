import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Pdstyles } from '@/constants/Styles'
import { ThemedView } from '@/components/ThemedView'
import { Link } from 'expo-router'

const Page = () => {
  return (
    <View style={[Pdstyles.container, { justifyContent: 'space-between', backgroundColor:'#202024'} ]}>
      <View style={{flex: 4, marginTop: 80, padding: 20}}>
        <Text style={styles.header}>From mess to bless—your meals, sorted</Text>
         </View>
      <View style={styles.buttons}>
        <Link href={'/signin'} style={[Pdstyles.pillButton, {flex: 1, backgroundColor:'##FD356D'}]} asChild>
        <TouchableOpacity >
        <Text style={[Pdstyles.buttonText]}>Sign in</Text>
        </TouchableOpacity>
        </Link>
        <Link href={'/signup'} style={[Pdstyles.pillButton, {flex: 1, backgroundColor:'#FD356D'}]} asChild>
        <TouchableOpacity >
        <Text style={[Pdstyles.buttonText]}>Sign up</Text>
        </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

export default Page

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',

    },
    header: {
        fontSize: 36,
        // fontWeight: 'bold',
        color: '#FD356D',
        textTransform: 'uppercase',
        fontFamily: 'PlayRegular'
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        // marginBottom: 40,
        // // borderWidth: 2,
        // // borderColor: '#FF4298',
        // backgroundColor: Colors.dark,
        // padding: 10,
        // paddingHorizontal: 50,
        // borderRadius: 12,
    }
})