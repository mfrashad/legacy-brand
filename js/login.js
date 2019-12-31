$('.message a').click(function(){
  $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
  let text = $('h1').text();
  $('h1').text(text === "Login" ? "Register" : "Login");
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    window.location.replace("subscribe.html")
  } else {
    console.log("unsigned")
    // No user is signed in.
  }
});

$('.register-form #registerButton').on('click', e => {
  e.preventDefault()
  const email = $('#registerEmail').val()
  const password = $("#registerPassword").val()
  const confirmPassword = $("#registerConfirmPassword").val()

  var user = firebase.auth().currentUser;

  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(function(){window.location.replace('subscribe.html')})
  .catch(error => {
    // Handle Errors here.
    var errorCode = error.code
    var errorMessage = error.message
    console.log(errorMessage)
    $('.alert p').text(errorMessage)
    $('.alert').show()
    // ...
  });

})

$('.login-form #loginButton').on('click', e => {
  e.preventDefault()
  const email = $('#loginEmail').val()
  const password = $("#loginPassword").val()

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(){window.location.replace('subscribe.html')})
  .catch(error => {
    // Handle Errors here.
    var errorCode = error.code
    var errorMessage = error.message
    console.log(errorMessage)
    $('.alert p').text(errorMessage)
    $('.alert').show()
    
    
    // ...
  });
})

var provider = new firebase.auth.GoogleAuthProvider();

$('#googleButton').on('click', e => {
  e.preventDefault()
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log("Signed in")
    window.location.replace("subscribe.html")
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    $('.alert p').text(errorMessage)
    $('.alert').show()
    // ...
  });
})




