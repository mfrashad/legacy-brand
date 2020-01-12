$('.message a').click(function(){
  $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
  let text = $('h1').text();
  $('h1').text(text === "Login" ? "Register" : "Login");
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    window.location.replace("dashboard.html")
  } else {
    console.log("unsigned")
    // No user is signed in.
  }
});

$('.register-form').on('submit', e => {
  e.preventDefault()
  const email = $('#registerEmail').val()
  const password = $("#registerPassword").val()
  const confirmPassword = $("#registerConfirmPassword").val()
  const text = loading("#registerButton");
  const register = firebase.functions().httpsCallable('register');

  register({email, password})
  .then((user) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => location.replace('subcribe.html'));
  })
  .catch(error => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    toast(errorMessage);
    stopLoading('#registerButton', text);
  });

})

$('.login-form').on('submit', e => {
  e.preventDefault()
  const email = $('#loginEmail').val();
  const password = $("#loginPassword").val();
  const text = loading("#loginButton");

  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(){window.location.replace('dashboard.html')})
  .catch(error => {
    var errorCode = error.code;
    var errorMessage = error.message;
    toast(errorMessage);
    stopLoading('#loginButton', text);
  });
})

var provider = new firebase.auth.GoogleAuthProvider();

$('.googleButton').on('click',(e) => {
  e.preventDefault();
  const email = $('#registerEmail').val()
  const password = $("#registerPassword").val()
  const createCustomer = firebase.functions().httpsCallable('createCustomer');

  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
  .then((result) => {
    window.location.replace('subscribe.html');
  })
  .catch(error => {
    // Handle Errors here.
    console.log(error);
    debugger;
    var errorCode = error.code;
    var errorMessage = error.message;
    toast(errorMessage);
  });
})





