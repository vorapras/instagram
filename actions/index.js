import uuid from 'uuid-random';
import firebase from 'firebase';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import db from '../config/firebase';

const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

export const uploadPhoto = (image) => {
  return async (dispatch) => {
    try {
      const resize = await ImageManipulator.manipulateAsync(image.uri, [], { format: 'jpeg', compress: 0.1 })
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.onload = () => resolve(xhr.response) 
        xhr.responseType = 'blob'
        xhr.open('GET', resize.uri, true)
        xhr.send(null)
      });
      //console.log(uuid.v4())
      const uploadTask = await firebase.storage().ref().child(uuid()).put(blob)
      const downloadURL = await uploadTask.ref.getDownloadURL()
      return downloadURL
    } catch(e) {
      console.error(e)
    }
  }
}

export const allowNotifications = () => {
  return async (dispatch, getState) => {
    const { uid } = getState().user
    try {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      //console.log(status);
      if (status === 'granted') {
        const token = (await Notifications.getExpoPushTokenAsync()).data
        dispatch({ type: 'GET_TOKEN', payload: token})
        console.log(token)
        db.collection('users').doc(uid).update({ token: token })
      }
    } catch (e) {
      console.error(e)
    }
  }
}

export const sendNotification = (uid, text) => {
  return async (dispatch, getState) => {
    const { username } = getState().user
    try {
      const user = await db.collection('users').doc(uid).get()
      if (user.data().token) {
        fetch(PUSH_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: user.data().token,
            title: username,
            body: text,
          })
        })
      }
    } catch (e) {
      console.error(e)
    }
  }
}

