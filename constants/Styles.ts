import { StyleSheet } from 'react-native';
import {Colors} from '@/constants/Colors';

export const Pdstyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    fontSize: 40,
    // fontWeight: '700',
    fontFamily: 'PlayRegular'
  },
  pillButton: {
    padding: 10,
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textLink: {
    // color: Colors.primary,
    fontSize: 18,
    fontWeight: '500',
  },
  descriptionText: {
    fontFamily: 'PlayRegular',
    fontSize: 18,
    marginTop: 20,
    // color: Colors.gray,
  },
  buttonText: {
    color: '#fff',
    // color: '#A64D79',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'PlayRegular'
  },
  pillButtonSmall: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextSmall: {
    // color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 20,
    marginBottom: 10,
  },
  block: {
    marginHorizontal: 20,
    padding: 14,
    // backgroundColor: '#fff',
    borderRadius: 16,
    gap: 20,
  },
  border:{
    borderColor: 'magenta', 
    borderWidth: StyleSheet.hairlineWidth
  }
});