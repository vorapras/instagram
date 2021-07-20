import React from 'react';
import styles from '../styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { uploadPhoto } from '../actions/index';
import { updatePhoto } from '../actions/post';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

class CameraUpload extends React.Component {
  
  state = {
      type: Camera.Constants.Type.back,
      isFlashLightOn: Camera.Constants.FlashMode.off,
      focus: Camera.Constants.AutoFocus.on
  }

   //flip the camera
   flipCamera = () => {
    this.setState({
      type:
      this.state.type === Camera.Constants.Type.back 
      ? Camera.Constants.Type.front 
      : Camera.Constants.Type.back
    })
  }

  //Toggle flash light
  flashLight = () => {
    this.setState({
      isFlashLightOn: 
        this.state.isFlashLightOn === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    })
  }

  //Take Photo
  snapPhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    if (status === 'granted') {
      const image = await this.camera.takePictureAsync()
      if(!image.cancelled ){
        const resize = await ImageManipulator.manipulateAsync(image.uri, [], { format: 'jpeg', compress: 0.1 })
        const url = await this.props.dispatch(uploadPhoto(resize))
        this.props.dispatch(updatePhoto(url))
        url ? this.props.navigation.navigate('Post') : null
      }
    }
  }

  render() {
    return (
      <Camera 
        style={{flex:1}} 
        type={this.state.type} 
        flashMode={this.state.isFlashLightOn}
        autoFocus={this.state.focus}
        ref={ref => { this.camera = ref }}  
      >
        <SafeAreaView style={{flex:1}}>
          <TouchableOpacity style={{ paddingLeft: 30 }} onPress={() => this.props.navigation.goBack()} >
            <Ionicons color={'white'} name={'ios-arrow-back'} size={50}/>
          </TouchableOpacity>
        </SafeAreaView>
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.iconHolder} onPress={() => this.flipCamera()}>
            <Ionicons 
              name="md-reverse-camera"
              size={35}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconHolder} onPress={() => this.snapPhoto()}>
            <FontAwesome 
              name="circle"
              size={35}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconHolder} onPress={() => this.flashLight()}>
            <FontAwesome 
              name="flash"
              size={35}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ uploadPhoto, updatePhoto }, dispatch)
}

const mapStateToProps = (state) => {
  return {}
}

export default connect(mapStateToProps)(CameraUpload)