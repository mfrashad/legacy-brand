firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    console.log("Signed in")
  } else {
    console.log("unsigned")
    // No user is signed in.
    window.location.replace('login.html')
  }
});