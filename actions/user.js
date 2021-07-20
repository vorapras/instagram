import firebase from 'firebase';
import db from '../config/firebase';
import * as Facebook from 'expo-facebook';
import orderBy from 'lodash.orderby';
import { allowNotifications, sendNotification } from './index.js';

export const updateEmail = (email) => {
    return {type: 'UPDATE_EMAIL', payload: email}
}

export const updatePassword = (password) => {
    return {type: 'UPDATE_PASSWORD', payload: password}
}

export const updateUsername = (username) => {
    return {type: 'UPDATE_USERNAME', payload: username}
}

export const updateBio = (bio) => {
    return {type: 'UPDATE_BIO', payload: bio}
}

export const updatePhoto = (userphoto) => {
    return {type: 'UPDATE_PHOTO', payload: userphoto}
}

export const login = () => {
    return async ( dispatch, getState ) => {
        try {
            const { email, password } = getState().user
            const response = await firebase.auth().signInWithEmailAndPassword(email, password)
			dispatch(getUser(response.user.uid))
			dispatch(allowNotifications())
        } catch (e) {
            alert(e)
        }
    }
}

export const facebookLogin = () => {
	return async (dispatch) => {
		try {
			await Facebook.initializeAsync({appId: '701323213806097',});
			const { type, token } = await Facebook.logInWithReadPermissionsAsync({permissions: ['public_profile'],});
			if(type === 'success') {
				// Build Firebase credential with the Facebook access token.
				const credential = await firebase.auth.FacebookAuthProvider.credential(token);
				console.log(token);
				console.log(credential);
				// Sign in with credential from the Facebook user.
				const response = await firebase.auth().signInWithCredential(credential)
				console.log(response);
				const user = await db.collection('users').doc(response.uid).get()
				if(!user.exists){
					const user = {
						uid: response.uid,
						email: response.email,
						username: response.displayName,
						bio: '',
						userphoto: response.photoURL,
						token: null,
						followers: [],
						following: []
					}
					db.collection('users').doc(response.uid).set(user)
					dispatch({type: 'LOGIN', payload: user})
				} else {
					dispatch(getUser(response.uid))
				}
			}
		} catch (e) {
			alert(e)
		}
	}
}


export const getUser = (uid, type) => {
    return async ( dispatch, getState ) => {
        try {
			const userQuery = await db.collection('users').doc(uid).get()
			let user = userQuery.data()

			let posts = []
			const postQuery = await db.collection('posts').where('uid', '==', uid).get()
			postQuery.forEach(function(response) {
				posts.push(response.data())
			})
			user.posts = orderBy(posts, 'date', 'desc')

			if (type === 'LOGIN') {
				dispatch({type: 'LOGIN', payload: user})
			} else {
				dispatch({type: 'GET_PROFILE', payload: user})
			}
			
        } catch (e) {
            alert(e)
        }
    }
}

export const updateUser = () => {
    return async ( dispatch, getState ) => {
		const { uid, username, bio, photo } = getState().user
        try {
			db.collection('users').doc(uid).update({
				username: username,
				bio: bio,
				userphoto: photo
			})
        } catch (e) {
            alert(e)
        }
    }
}

export const signup = () => {
	return async (dispatch, getState) => {
		try {
			const { email, password, username, bio } = getState().user
			const response = await firebase.auth().createUserWithEmailAndPassword(email, password)
			if(response.user.uid) {
				const user = {
					uid: response.user.uid,
					email: email,
					username: username,
					bio: bio,
					userphoto: '',
					token: null,
					followers: [],
					following: []
				}
				db.collection('users').doc(response.user.uid).set(user)
				dispatch({type: 'LOGIN', payload: user})
			}
		} catch (e) {
			alert(e)
		}
	}
}

export const followerUser = (user) => {
	return async (dispatch, getState) => {
		const { uid, userphoto, username} = getState().user
		try {
				db.collection('users').doc(user.uid).update({
					followers: firebase.firestore.FieldValue.arrayUnion(uid)
				})
				db.collection('users').doc(uid).update({
					following: firebase.firestore.FieldValue.arrayUnion(user.uid)
				})
				db.collection('activity').doc().set({
					followerId: uid,
					followerPhoto: userphoto,
					followerName: username,
					uid: user.uid,
					photo: user.userphoto,
					username: user.username,
					date: new Date().getTime(),
					type: 'FOLLOWER',
				  })
				dispatch(sendNotification(user.uid, 'Started Following You'))
				dispatch(getUser(user.uid))
		} catch (e) {
			console.error(e)
		}
	}
}

export const unfollowerUser = (user) => {
	return async (dispatch, getState) => {
		const { uid, userphoto, username} = getState().user
		try {
				db.collection('users').doc(user.uid).update({
					followers: firebase.firestore.FieldValue.arrayRemove(uid)
				})
				db.collection('users').doc(user.uid).update({
					following: firebase.firestore.FieldValue.arrayRemove(user.uid)
				})
				dispatch(getUser(user.uid))
		} catch (e) {
			console.error(e)
		}
	}
}