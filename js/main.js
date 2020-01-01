AOS.init({duration: 500, delay: 300});

const db = firebase.firestore()

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('Signed in')
    $("#auth-btn").text("Log out").click(() => {
      firebase.auth().signOut()
      window.location.replace("login.html")
    })
    
    // ...
  } else {
    // User is signed out.
    // ...
    $("#auth-btn").text("Login").click(e => window.location.replace("login.html"))
  }
})

$('.alert button').click(function() { $(".alert").hide()})

function toast(message) {
  $('.alert p').text(message)
  $('.alert').show()
}

function loading(element){
  $(element).html("<img src='assets/loading-white.svg' width='30px'>");
}



