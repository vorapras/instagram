import firebase from 'firebase';
import db from '../config/firebase';
import uuid from 'uuid-random';
import cloneDeep from 'lodash.clonedeep';
import orderBy from 'lodash.orderby';
import { sendNotification } from './index.js';

export const updateDescription = (text) => {
    return {type: 'UPDATE_DESCRIPTION', payload: text}
}

export const updatePhoto = (photo) => {
    return {type: 'UPDATE_PHOTO', payload: photo}
}

export const updateLocation = (input) => {
	return {type: 'UPDATE_LOCATION', payload: input}
}

export const uploadPost = () => {
    return async ( dispatch, getState ) => {
        try {
            const { post, user } = getState()
            const id = uuid()
            const upload = {
                id: id,
                postPhoto: post.photo,
                postDescription: post.description || ' ',
                postLocation: post.location || ' ',
                uid: user.uid,
                userphoto: user.userphoto || ' ',
                username: user.username,
                date: new Date().getTime(),
                likes: [],
                comments: []
            }
           db.collection('posts').doc(id).set(upload)
           dispatch(getPosts())
        } catch (e) {
            console.error(e)
        }
    }
}

export const getPosts = () => {
    return async ( dispatch, getState ) => {
        try {
            const posts = await db.collection('posts').get()

            let array = []
            posts.forEach((post) => {
                array.push(post.data())
            })
            //console.log(array)
            dispatch({type: 'GET_POSTS', payload: orderBy(array, 'date', 'desc')})
        } catch (e) {
            alert(e)
        }
    }
}

export const likePost = (post) => {
    return async ( dispatch, getState ) => {
        const { uid, username, userphoto } = getState().user
        try {
                db.collection('posts').doc(post.id).update({
                    likes: firebase.firestore.FieldValue.arrayUnion(uid)
                })

                db.collection('activity').doc().set({
                    postId: post.id,
                    postPhoto: post.postPhoto,
                    likerId: uid,
                    likerPhoto: userphoto,
                    likerName: username,
                    uid: post.uid,
                    date: new Date().getTime(),
                    type: 'LIKE'
                })
            dispatch(sendNotification(post.uid, 'Liked Your Photo'))
            dispatch(getPosts())
        } catch (e) {
            console.error(e)
        }
    }
}

export const unlikePost = (post) => {
    return async ( dispatch, getState ) => {
        const { uid } = getState().user
        try {
                db.collection('posts').doc(post.id).update({
                    likes: firebase.firestore.FieldValue.arrayRemove(uid)
                })

                const query = await db.collection('activity').where('postId', '==', post.id).where('likerId','==',uid).get()
                query.forEach((response) => {
                    response.ref.delete()
                })

            dispatch(getPosts())
        } catch (e) {
            console.error(e)
        }
    }
}


export const getComments = (post) => {
	return dispatch => {
        dispatch({ type: 'GET_COMMENTS', payload: orderBy(post.comments, 'date', 'desc') })
    }
}

export const addComment = (text, post) => {
    return async ( dispatch, getState ) => {
        const { uid, userphoto, username } = getState().user
        let comments = cloneDeep(getState().post.comments.reverse())
        try {
            const comment = {
                comment: text,
                commenterId: uid,
                commenterPhoto: userphoto || '',
                commenterName: username,
                date: new Date().getTime(),
            }
            //console.log(comment)
            db.collection('posts').doc(post.id).update({
                comments: firebase.firestore.FieldValue.arrayUnion(comment)
            })
            comment.postId = post.id
            comment.postPhoto = post.postPhoto
            comment.uid = post.uid
            comment.type = 'COMMENT'
            comments.push(comment)
            dispatch({ type: 'GET_COMMENTS', payload: comments.reverse() })

            dispatch(sendNotification(post.uid, text))
            db.collection('activity').doc().set(comment)

        } catch (e) {
            console.error(e)
        }
    }
}