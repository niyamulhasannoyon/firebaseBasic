import './App.css'
import * as firebase from 'firebase/app';
import 'firebase/auth';
// import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase.config';
import { GoogleAuthProvider, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getAuth, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';


firebase.initializeApp(firebaseConfig);

function App() {
const [newUser, setNewUser] = useState(false);
const [user, setUser] = useState({
  isSignedIn: false,
  photoURL: '',
  displayName: '',
  email: '',
  newUser: false
});

const provider = new GoogleAuthProvider();

const handleSignIn = () => {
  const auth = getAuth();
  signInWithPopup(auth, provider)
  .then(result => {
    const {displayName, photoURL, email} = result.user;

    const signedInUser = {
      isSignedIn: true,
      photo: photoURL,
      name: displayName,
      email: email
    }
    setUser(signedInUser);
    // console.log(result);
  })
  .catch(error => {
    console.log(error);
    console.log(error.message);
  });
};

const handleSignOut = () => {
  const auth = getAuth();
  auth.signOut()
  .then(res => {
    const signnedOutUser = {
      isSignedIn: false, 
      photoURL: '',
      displayName: '',
      email: '',
      error: '',
      success: false,
    }
    setUser(signnedOutUser);
  })
  .catch(error => {
    console.log(error);
  })
}

const handleBlur = (e) => {
  console.log(e.target.name, e.target.value);
  let isFieldValid = true;
  if(e.target.name === 'email'){
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    isFieldValid = emailPattern.test(e.target.value);
    console.log(isFieldValid);
  }

  if(e.target.name === 'password'){
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const isPasswordValid = passwordPattern.test(e.target.value);
    isFieldValid = isPasswordValid ;
    console.log(isFieldValid);
  }
  if(isFieldValid){
    const newUserInfo = {...user};
    newUserInfo[e.target.name] = e.target.value;
    setUser(newUserInfo);
  }
}

const handleSubmit = (e) => {
  // console.log(user.email, user.password)
  if(newUser && user.email && user.password){
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, user.email, user.password)
    .then(res => {
    const newUserInfo = {...user};
    newUserInfo.error = '';
    newUserInfo.success = true;
    setUser(newUserInfo);
    updateUserInfo(user.name);
  })
  .catch((error) => {
    const newUserInfo = {...user};
    newUserInfo.error = error.message;
    newUserInfo.success = false;
    setUser(newUserInfo);
  });
  }
  if (newUser && newUser.email && newUser.password){
    const auth = getAuth();
    signInWithEmailAndPassword(auth, user.email, user.password)
    .then(res => {
      const newUserInfo = {...user};
      newUserInfo.error = '';
      newUserInfo.success = true;
      setUser(newUserInfo);
      console.log('Sign in user info', res.user);
    })
    .catch((error) => {
      const newUserInfo = {...user};
      newUserInfo.error = error.message;
      newUserInfo.success = false;
      setUser(newUserInfo);
    });
  }
  e.preventDefault();
}

const updateUserInfo = (name) => {
  const auth = getAuth();
  updateProfile(auth.currentUser, { displayName: name })
  .then((res) => {
    console.log('User name updated successfull')
  })
  .catch(error => {
    console.log(error);
  });
}

  return (
    <>
      <div>
        {
          user.isSignedIn? <button onClick={handleSignOut}>Sign out</button> : 
          <button onClick={handleSignIn}>Sign in</button>
        }
        {
          user.isSignedIn &&
          <div>
            <img style={{borderRadius:"50%"}} src={user.photo} alt="User" />
            <h3>Welcome {user.name} !!</h3>
            <p>{user.email}</p>
          </div>
        }

        <h2>Our Own Authentication</h2>

        <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
        <label htmlFor="newUser">New User Sign up</label>

      <form onSubmit={handleSubmit}>
        {
          newUser && <input name='name' onBlur={handleBlur} type="text" placeholder='Your Name' />
        } <br/><br/>
        <input type="text" name='email' onBlur={handleBlur} placeholder='Enter your Email' required /> <br/><br/>
        <input type="password" name='password' onBlur={handleBlur} placeholder='Enter your Password' required/> <br/><br/>
        <input type="submit" value={newUser? 'Sign up' : 'Sign In'} />
      </form>
          {
            user.success &&
            <p style={{color: 'green'}}>User { newUser ? 'created' : 'logged In'} successfully</p>
          }
          {
            user.error &&
            <p style={{color:'red'}}>{user.error}</p>
          }

      </div>
    </>
  )
}

export default App
