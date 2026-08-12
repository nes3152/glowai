import React, { useState, useRef } from 'react';                                          
import {                                                                                  
  View, Text, StyleSheet, TouchableOpacity,                                               
  Dimensions, Alert, Image                                                                
} from 'react-native';                                                                    
import { CameraView, useCameraPermissions } from 'expo-camera';                           
                                                                                          
const { width, height } = Dimensions.get('window');                                       

const STEPS = [                                                                           
  { label: 'Front', instruction: 'Look straight at the camera', emoji: '😊' },
  { label: 'Left Side', instruction: 'Turn your head slowly to the left', emoji: '😏' },
  { label: 'Right Side', instruction: 'Turn your head slowly to the right', emoji: '😏' },
];
                                                                                          
export default function CaptureScreen({ navigation }) {                                   
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState(0);                                                    
  const [photos, setPhotos] = useState([]);
  const cameraRef = useRef(null);

  if (!permission) return <View />;                                                       

  if (!permission.granted) {                                                              
    return (    
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need camera access to analyze your
skin</Text>                                                                               
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>                   
        </TouchableOpacity>
      </View>
    );
  }
                                                                                          
  const takePicture = async () => {
    if (!cameraRef.current) return;                                                       
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    const newPhotos = [...photos, photo.uri];
    setPhotos(newPhotos);                                                                 

    if (step < 2) {                                                                       
      setStep(step + 1);
    } else {
      navigation.navigate('Concern', { photos: newPhotos });
    }                                                                                     
  };
                                                                                          
  return (      
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressBar}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}                                                                               
      </View>
                                                                                          
      {/* Step info */}
      <View style={styles.header}>
        <Text style={styles.stepCount}>Photo {step + 1} of 3</Text>
        <Text style={styles.stepLabel}>{STEPS[step].label}</Text>                         
        <Text style={styles.instruction}>{STEPS[step].instruction}</Text>
      </View>                                                                             
                
      {/* Camera */}                                                                      
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front">
          {/* Face oval guide */}
          <View style={styles.overlay}>                                                   
            <View style={styles.oval} />
          </View>                                                                         
        </CameraView>
      </View>

      {/* Capture button */}                                                              
      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <View style={styles.captureInner} />                                              
      </TouchableOpacity>

      {/* Taken photos thumbnails */}                                                     
      <View style={styles.thumbnails}>
        {STEPS.map((s, i) => (                                                            
          <View key={i} style={[styles.thumb, i < photos.length && styles.thumbDone]}>
            {photos[i]                                                                    
              ? <Image source={{ uri: photos[i] }} style={styles.thumbImage} />
              : <Text style={styles.thumbEmoji}>{s.emoji}</Text>                          
            }   
          </View>
        ))}                                                                               
      </View>
    </View>                                                                               
  );            
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', paddingTop: 60
},                                                                                        
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center',
backgroundColor: '#0f0f0f', padding: 30 },                                                
  permissionText: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 30 },
  permissionButton: { backgroundColor: '#e94560', padding: 16, borderRadius: 20 },        
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  progressBar: { flexDirection: 'row', gap: 8, marginBottom: 20 },                        
  dot: { width: 30, height: 4, borderRadius: 2, backgroundColor: '#333' },
  dotActive: { backgroundColor: '#e94560' },                                              
  header: { alignItems: 'center', marginBottom: 20 },                                     
  stepCount: { color: '#888', fontSize: 13 },
  stepLabel: { color: '#fff', fontSize: 26, fontWeight: '700', marginTop: 4 },            
  instruction: { color: '#aaa', fontSize: 14, marginTop: 6 },                             
  cameraContainer: { width: width * 0.85, height: width * 1.1, borderRadius: 30, overflow:
 'hidden' },                                                                              
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },                   
  oval: {       
    width: width * 0.55, height: width * 0.75,
    borderRadius: width * 0.4,                                                            
    borderWidth: 3, borderColor: '#e94560',
    borderStyle: 'dashed',                                                                
  },                                                                                      
  captureButton: {
    width: 80, height: 80, borderRadius: 40,                                              
    backgroundColor: 'transparent', borderWidth: 4, borderColor: '#e94560',
    justifyContent: 'center', alignItems: 'center', marginTop: 24,                        
  },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#e94560' },  
  thumbnails: { flexDirection: 'row', gap: 12, marginTop: 20 },                           
  thumb: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#222',
justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#333' },    
  thumbDone: { borderColor: '#e94560' },
  thumbImage: { width: 46, height: 46, borderRadius: 10 },                                
  thumbEmoji: { fontSize: 22 },
});            