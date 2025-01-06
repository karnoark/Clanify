import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { StyleSheet, Image, Platform, View } from 'react-native';

import { Text } from '@/src/components/common/Text';
import { storage, useAuthStore } from '@/src/store/auth';

export default function TabTwoScreen() {
  const zustandUser = useAuthStore(state => state.user);
  const zustandSession = useAuthStore(state => state.session);
  const signOut = useAuthStore(state => state.signOut);

  // console.log("zustandUser: ", zustandUser);
  // console.log("zustandSession: ", zustandSession);

  const mmkvUser = storage.getString('user');
  const mmkvSession = storage.getString('session');

  // console.log("mmkvUser: ", mmkvUser);
  // console.log("mmkvSession: ", mmkvSession);

  //signing out logic
  // useEffect(() => {
  //   (async () => {
  //     await new Promise(resolve => {
  //       setTimeout(() => {
  //         // console.log("is settimeout working?");
  //         console.log('signing out ......');
  //         signOut();
  //       }, 1000);
  //     });
  //   })();
  // }, []);

  return (
    <View>
      <Text> Explore it</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
