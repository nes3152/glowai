import React, { useState } from 'react';                                                  
import {                                                                                  
  View, Text, StyleSheet, TouchableOpacity, Dimensions                                    
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';                                    
                
const { width } = Dimensions.get('window');

const BUDGETS = [
  { id: 'budget1', label: 'Under $30', sub: 'Drugstore picks', emoji: '💰' },
  { id: 'budget2', label: '$30 – $60', sub: 'Mid-range essentials', emoji: '💳' },        
  { id: 'budget3', label: '$60 – $100', sub: 'Premium K-Beauty', emoji: '✨' },           
  { id: 'budget4', label: '$100 – $200', sub: 'Luxury routine', emoji: '💎' },            
  { id: 'budget5', label: '$200+', sub: 'All the best', emoji: '👑' },                    
];                                                                                        
                
export default function BudgetScreen({ route, navigation }) {                             
  const { photos, concerns } = route.params;
  const [selected, setSelected] = useState(null);

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <View style={styles.header}>                                                        
        <Text style={styles.title}>What's your monthly{'\n'}skincare budget?</Text>
        <Text style={styles.sub}>We'll recommend products within your range</Text>        
      </View>                                                                             

      <View style={styles.options}>                                                       
        {BUDGETS.map((item) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity                                                             
              key={item.id}
              style={[styles.option, isSelected && styles.optionSelected]}                
              onPress={() => setSelected(item.id)}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, isSelected &&                           
styles.optionLabelSelected]}>
                  {item.label}                                                            
                </Text>
                <Text style={styles.optionSub}>{item.sub}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}                        
              </View>
            </TouchableOpacity>                                                           
          );    
        })}
      </View>

      <TouchableOpacity                                                                   
        style={[styles.button, !selected && styles.buttonDisabled]}
        disabled={!selected}                                                              
        onPress={() => navigation.navigate('Analyzing', { photos, concerns, budget:
selected })}>
        <Text style={styles.buttonText}>
          {selected ? 'Analyze My Skin →' : 'Select a budget'}
        </Text>                                                                           
      </TouchableOpacity>
    </LinearGradient>                                                                     
  );            
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 24 },
  header: { marginBottom: 32 },                                                           
  title: { fontSize: 30, fontWeight: '800', color: '#fff', lineHeight: 38 },
  sub: { fontSize: 15, color: '#8892b0', marginTop: 8 },                                  
  options: { gap: 12 },
  option: {                                                                               
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',                                            
    borderRadius: 16, padding: 18,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  optionSelected: { borderColor: '#e94560', backgroundColor: 'rgba(233,69,96,0.15)' },
  emoji: { fontSize: 28, marginRight: 14 },                                               
  optionText: { flex: 1 },
  optionLabel: { fontSize: 17, fontWeight: '700', color: '#ccd6f6' },                     
  optionLabelSelected: { color: '#fff' },                                                 
  optionSub: { fontSize: 13, color: '#8892b0', marginTop: 2 },
  radio: {                                                                                
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#555',
    justifyContent: 'center', alignItems: 'center',                                       
  },
  radioSelected: { borderColor: '#e94560' },                                              
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#e94560' },
  button: {                                                                               
    position: 'absolute', bottom: 40, left: 24, right: 24,
    backgroundColor: '#e94560', borderRadius: 30,                                         
    paddingVertical: 18, alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#444' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },                         
});
