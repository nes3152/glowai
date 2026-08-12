 import React from 'react';
  import {                                                                                  
    View, Text, StyleSheet,
    TouchableOpacity, Dimensions, StatusBar                                                 
  } from 'react-native';
  import { LinearGradient } from 'expo-linear-gradient';

  const { width, height } = Dimensions.get('window');                                       
  
  export default function WelcomeScreen({ navigation }) {                                   
    return (      
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
        <StatusBar barStyle="light-content" />
                                                                                            
        <View style={styles.topSection}>
          <Text style={styles.emoji}>✨</Text>                                              
          <Text style={styles.appName}>ifoundit</Text>
          <Text style={styles.tagline}>
            Snap. Analyze.{'\n'}Find your perfect skincare.                                 
          </Text>
        </View>                                                                             
                  
        <View style={styles.stepsContainer}>                                                
          {[
            { icon: '📸', text: 'Take 3 selfies (front & sides)' },                         
            { icon: '🔬', text: 'AI analyzes your skin' },
            { icon: '💄', text: 'Get your personalized routine' },                          
          ].map((item, i) => (
            <View key={i} style={styles.stepRow}>                                           
              <Text style={styles.stepIcon}>{item.icon}</Text>                              
              <Text style={styles.stepText}>{item.text}</Text>
            </View>                                                                         
          ))}     
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Capture')}>                                   
          <Text style={styles.buttonText}>Get Started →</Text>
        </TouchableOpacity>                                                                 
                  
        <Text style={styles.sub}>Free · Takes only 2 minutes</Text>                         
      </LinearGradient>
    );                                                                                      
  }               

  const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'space-between',
  paddingVertical: 80, paddingHorizontal: 30 },                                             
    topSection: { alignItems: 'center' },
    emoji: { fontSize: 60, marginBottom: 16 },                                              
    appName: { fontSize: 42, fontWeight: '800', color: '#ffffff', letterSpacing: 1 },
    tagline: { fontSize: 18, color: '#a8b2d8', textAlign: 'center', marginTop: 12,          
  lineHeight: 26 },                                                                         
    stepsContainer: { width: '100%', gap: 16 },                                             
    stepRow: { flexDirection: 'row', alignItems: 'center', backgroundColor:                 
  'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16 },                                
    stepIcon: { fontSize: 26, marginRight: 14 },
    stepText: { fontSize: 15, color: '#ccd6f6', fontWeight: '500' },                        
    button: { backgroundColor: '#e94560', borderRadius: 30, paddingVertical: 18,            
  paddingHorizontal: 60, width: '100%', alignItems: 'center' },                             
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },                         
    sub: { color: '#8892b0', fontSize: 13 },                                                
  });                                                                                       
  
