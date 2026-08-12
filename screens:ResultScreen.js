import React from 'react';                                                                
import {                                                                                  
  View, Text, StyleSheet, ScrollView,                                                     
  TouchableOpacity, Dimensions, Image
} from 'react-native';                                                                    
import { LinearGradient } from 'expo-linear-gradient';
                                                                                          
const { width } = Dimensions.get('window');

const SKIN_REPORT = {
  type: 'Combination',
  score: 72,                                                                              
  concerns: {
    acne: 65, pores: 80, wrinkles: 30,                                                    
    dryness: 45, oiliness: 70,                                                            
  },
};                                                                                        
                
const PRODUCTS = [
  {
    step: 'Cleanser',
    name: 'COSRX Low pH Good Morning Gel Cleanser',                                       
    brand: 'COSRX',
    price: '$12',                                                                         
    reason: 'Perfect for combination skin — removes excess oil without stripping moisture.',
    emoji: '🧴',                                                                          
    badge: 'K-Beauty',                                                                    
  },
  {                                                                                       
    step: 'Toner',
    name: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner',
    brand: 'Some By Mi',                                                                  
    price: '$18',
    reason: 'Gently exfoliates to minimize pores and smooth texture.',                    
    emoji: '💧',                                                                          
    badge: 'K-Beauty',
  },                                                                                      
  {             
    step: 'Serum',
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',                                                                
    price: '$7',
    reason: 'Reduces dark spots and controls oil production effectively.',                
    emoji: '🔬',                                                                          
    badge: 'Best Value',
  },                                                                                      
  {             
    step: 'Moisturizer',
    name: 'Anua Heartleaf 77% Soothing Cream',
    brand: 'Anua',                                                                        
    price: '$24',
    reason: 'Lightweight hydration that calms redness and sensitivity.',                  
    emoji: '🌿',                                                                          
    badge: 'K-Beauty',
  },                                                                                      
  {             
    step: 'SPF',
    name: 'Beauty of Joseon Relief Sun : Rice + Probiotics',
    brand: 'Beauty of Joseon',                                                            
    price: '$16',
    reason: 'Lightweight Korean sunscreen — no white cast, perfect daily finish.',        
    emoji: '☀️ ',                                                                          
    badge: 'K-Beauty',
  },                                                                                      
];              
                                                                                          
export default function ResultScreen({ navigation }) {
  const total = PRODUCTS.reduce((sum, p) => sum + parseInt(p.price.replace('$', '')), 0);

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>                                   
 
        {/* Header */}                                                                    
        <View style={styles.header}>
          <Text style={styles.title}>Your Skin Report ✨</Text>
          <Text style={styles.sub}>Based on your 3-angle analysis</Text>                  
        </View>
                                                                                          
        {/* Skin score */}                                                                
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>                                               
            <Text style={styles.scoreNumber}>{SKIN_REPORT.score}</Text>
            <Text style={styles.scoreLabel}>Skin Score</Text>
          </View>
          <View style={styles.scoreInfo}>                                                 
            <Text style={styles.skinType}>Skin Type</Text>
            <Text style={styles.skinTypeValue}>{SKIN_REPORT.type}</Text>                  
            <View style={styles.bars}>                                                    
              {Object.entries(SKIN_REPORT.concerns).map(([key, val]) => (
                <View key={key} style={styles.barRow}>                                    
                  <Text style={styles.barLabel}>{key.charAt(0).toUpperCase() +            
key.slice(1)}</Text>
                  <View style={styles.barTrack}>                                          
                    <View style={[styles.barFill, { width: `${val}%`, backgroundColor: val
 > 60 ? '#e94560' : '#4caf50' }]} />                                                      
                  </View>
                </View>                                                                   
              ))}
            </View>
          </View>
        </View>

        {/* Routine */}                                                                   
        <Text style={styles.sectionTitle}>Your Personalized Routine</Text>
        <Text style={styles.sectionSub}>Morning & Evening · Total: ${total}</Text>        
                                                                                          
        {PRODUCTS.map((product, i) => (
          <View key={i} style={styles.productCard}>                                       
            <View style={styles.productTop}>
              <Text style={styles.productEmoji}>{product.emoji}</Text>
              <View style={styles.productInfo}>
                <View style={styles.productTopRow}>
                  <Text style={styles.productStep}>{product.step}</Text>                  
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badge}>{product.badge}</Text>                     
                  </View>
                </View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>                  
              </View>
              <Text style={styles.productPrice}>{product.price}</Text>                    
            </View>
            <View style={styles.reasonBox}>
              <Text style={styles.reasonText}>💡 {product.reason}</Text>                  
            </View>
          </View>                                                                         
        ))}     

        {/* Retake button */}
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={() => navigation.navigate('Welcome')}>                                 
          <Text style={styles.retakeText}>Start Over →</Text>
        </TouchableOpacity>                                                               
                
        <View style={{ height: 60 }} />                                                   
      </ScrollView>
    </LinearGradient>                                                                     
  );            
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 24, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },                              
  sub: { fontSize: 14, color: '#8892b0', marginTop: 4 },
  scoreCard: {                                                                            
    flexDirection: 'row', marginHorizontal: 24,                                           
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, padding: 20, marginBottom: 28, gap: 16,                             
  },                                                                                      
  scoreCircle: {
    width: 90, height: 90, borderRadius: 45,                                              
    borderWidth: 4, borderColor: '#e94560',
    justifyContent: 'center', alignItems: 'center',                                       
  },
  scoreNumber: { fontSize: 28, fontWeight: '800', color: '#fff' },                        
  scoreLabel: { fontSize: 10, color: '#8892b0' },
  scoreInfo: { flex: 1 },                                                                 
  skinType: { fontSize: 12, color: '#8892b0' },
  skinTypeValue: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 10 },    
  bars: { gap: 6 },                                                                       
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 11, color: '#8892b0', width: 55 },                                
  barTrack: { flex: 1, height: 4, backgroundColor: '#333', borderRadius: 2, overflow:     
'hidden' },
  barFill: { height: '100%', borderRadius: 2 },                                           
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', paddingHorizontal: 24,
marginBottom: 4 },                                                                        
  sectionSub: { fontSize: 13, color: '#8892b0', paddingHorizontal: 24, marginBottom: 16 },
  productCard: {                                                                          
    marginHorizontal: 24, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',                                            
    borderRadius: 18, padding: 16,
  },                                                                                      
  productTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  productEmoji: { fontSize: 32, marginTop: 2 },                                           
  productInfo: { flex: 1 },
  productTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }, 
  productStep: { fontSize: 11, color: '#e94560', fontWeight: '700', textTransform:
'uppercase' },                                                                            
  badgeContainer: { backgroundColor: 'rgba(233,69,96,0.2)', paddingHorizontal: 8,
paddingVertical: 2, borderRadius: 8 },                                                    
  badge: { fontSize: 10, color: '#e94560', fontWeight: '600' },
  productName: { fontSize: 14, fontWeight: '700', color: '#fff', lineHeight: 20 },        
  productBrand: { fontSize: 12, color: '#8892b0', marginTop: 2 },
  productPrice: { fontSize: 18, fontWeight: '800', color: '#fff' },                       
  reasonBox: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10,
 padding: 10 },
  reasonText: { fontSize: 12, color: '#a8b2d8', lineHeight: 18 },                         
  retakeButton: {                                                                         
    marginHorizontal: 24, marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',                                             
    borderRadius: 30, paddingVertical: 16, alignItems: 'center',                          
  },
  retakeText: { color: '#fff', fontSize: 16, fontWeight: '700' },                         
});             

