import React, { useEffect, useRef, useState } from 'react';                               
  import {                                                                                  
    View, Text, StyleSheet, Animated, Dimensions                                            
  } from 'react-native';                                                                    
  import { LinearGradient } from 'expo-linear-gradient';

  const { width } = Dimensions.get('window');                                               
   
  const STEPS = [                                                                           
    { text: 'Scanning your skin tone...', emoji: '🔍' },
    { text: 'Detecting skin concerns...', emoji: '🧬' },
    { text: 'Analyzing ingredients...', emoji: '🔬' },                                      
    { text: 'Finding K-Beauty matches...', emoji: '🇰🇷' },
    { text: 'Building your routine...', emoji: '✨' },                                      
  ];                                                                                        
   
  export default function AnalyzingScreen({ route, navigation }) {                          
    const { photos, concerns, budget } = route.params;
    const [currentStep, setCurrentStep] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;                                 
    const pulseAnim = useRef(new Animated.Value(1)).current;
                                                                                            
    useEffect(() => {
      // Pulse animation
      Animated.loop(                                                                        
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true  
  }),             
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])                                                                                  
      ).start();
                                                                                            
      // Progress bar
      Animated.timing(progress, {
        toValue: 1, duration: 5000, useNativeDriver: false,
      }).start();

      // Step cycling                                                                       
      const interval = setInterval(() => {
        setCurrentStep(prev => {                                                            
          if (prev < STEPS.length - 1) {
            Animated.sequence([
              Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true
  }),                                                                                       
              Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true
  }),                                                                                       
            ]).start();
            return prev + 1;
          }
          return prev;
        });
      }, 1000);
                                                                                            
      // Navigate after 5.5 seconds
      const timer = setTimeout(() => {                                                      
        navigation.navigate('Result', { photos, concerns, budget });
      }, 5500);
                                                                                            
      return () => {
        clearInterval(interval);                                                            
        clearTimeout(timer);
      };
    }, []);

    const progressWidth = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (                                                                                
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
        {/* Pulse circle */}                                                                
        <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.pulseInner}>                                                  
            <Text style={styles.pulseEmoji}>🧴</Text>
          </View>                                                                           
        </Animated.View>
                                                                                            
        <Text style={styles.title}>Analyzing your skin</Text>
                                                                                            
        {/* Step text */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.stepEmoji}>{STEPS[currentStep].emoji}</Text>
          <Text style={styles.stepText}>{STEPS[currentStep].text}</Text>                    
        </Animated.View>
                                                                                            
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>                                                                             
   
        {/* Done steps */}                                                                  
        <View style={styles.doneList}>
          {STEPS.slice(0, currentStep).map((s, i) => (
            <Text key={i} style={styles.doneText}>✓ {s.text}</Text>
          ))}                                                                               
        </View>
      </LinearGradient>                                                                     
    );            
  }

  const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal:
   30 },                                                                                    
    pulseOuter: {
      width: 140, height: 140, borderRadius: 70,                                            
      backgroundColor: 'rgba(233,69,96,0.2)',
      justifyContent: 'center', alignItems: 'center', marginBottom: 40,                     
    },
    pulseInner: {                                                                           
      width: 100, height: 100, borderRadius: 50,
      backgroundColor: 'rgba(233,69,96,0.4)',
      justifyContent: 'center', alignItems: 'center',
    },                                                                                      
    pulseEmoji: { fontSize: 44 },
    title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 24 },            
    stepEmoji: { fontSize: 30, textAlign: 'center', marginBottom: 8 },
    stepText: { fontSize: 16, color: '#a8b2d8', textAlign: 'center', marginBottom: 32 },    
    progressTrack: {                                                                        
      width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)',                   
      borderRadius: 3, overflow: 'hidden', marginBottom: 32,                                
    },                                                                                      
    progressFill: { height: '100%', backgroundColor: '#e94560', borderRadius: 3 },
    doneList: { alignItems: 'flex-start', width: '100%', gap: 8 },                          
    doneText: { fontSize: 13, color: '#4caf50' },                                           
  });
