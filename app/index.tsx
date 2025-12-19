import {Redirect} from "expo-router"

export default function Index() {
    return <Redirect href={"/home"}/>
}

// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   SafeAreaView,
//   Dimensions,
//   StatusBar,
//   ScrollView,
// } from 'react-native';

// const { width } = Dimensions.get('window');

// export default function CleanProCarsScreen() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.logo}>CleanMyWheels</Text>
//         </View>

//         {/* Title */}
//         <View style={styles.titleContainer}>
//           <Text style={styles.titleBold}>Innovating the</Text>
//           <Text style={styles.titleLight}>Way You Care</Text>
//           <Text style={styles.titleBold}>
//             for <Text style={styles.carsText}>Cars</Text>
//           </Text>
//         </View>

//         {/* Hero Section */}
//         <View style={styles.heroContainer}>
//           <Image
//             source={{
//               uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
//             }}
//             style={styles.car}
//             resizeMode="contain"
//           />

//           {/* Badge */}
//           <View style={styles.badge}>
//             <Text style={styles.badgeText}>5k+ Happy Clients</Text>
//           </View>
//         </View>

//         {/* CTA */}
//         <TouchableOpacity activeOpacity={0.85} style={styles.cta}>
//           <Text style={styles.ctaText}>Reserve Service</Text>
//           <Text style={styles.ctaArrow}>↗</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F9FC',
//     paddingHorizontal: 20,
//     paddingTop: 80,
//   },

//   /* Header */
//   header: {
//     // alignItems: 'center',
//     marginTop: 12,
//   },
//   logo: {
//     fontSize: 21,
//     fontWeight: '700',
//     color: '#1A2938',
//     letterSpacing: 0.3,
//   },

//   /* Titles */
//   titleContainer: {
//     marginTop: 32,
//   },
//   titleBold: {
//     fontSize: 37,
//     fontWeight: '400',
//     color: '#1A2938',
//     lineHeight: 44,
//   },
//   titleLight: {
//     fontSize: 37,
//     fontWeight: '500',
//     color: '#64748B',
//     lineHeight: 44,
//   },
//   carsText: {
//     color: '#de1010ff',
//     fontWeight: "500",
//   },

//   /* Hero */
//   heroContainer: {
//     marginTop: 24,
//     alignItems: 'center',
//   },
//   car: {
//     width: width * 0.95,
//     height: width * 0.62,
//     borderRadius: 20,
//   },
//   badge: {
//     marginTop: 16,
//     backgroundColor: '#111111',
//     paddingHorizontal: 18,
//     paddingVertical: 9,
//     borderRadius: 20,
//   },
//   badgeText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   /* CTA */
//   cta: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#C8F000',
//     paddingVertical: 10,
//     marginHorizontal: 30,
//     marginVertical: 20,
//     borderRadius: 18,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.12,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   ctaText: {
//     color: '#000',
//     fontSize: 22,
//     fontWeight: '400',
//     marginRight: 10,
//   },
//   ctaArrow: {
//     color: '#000',
//     fontSize: 30,
//   },
// });
