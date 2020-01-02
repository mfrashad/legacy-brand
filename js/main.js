AOS.init({duration: 500, delay: 300});

const db = firebase.firestore()

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('Signed in')
    $("#auth-btn").text("Log out").click(() => {
      firebase.auth().signOut()
      window.location.replace("login.html")
    })
    $("#subscribeButton").text("VIEW DASHBOARD").click(e => window.location.replace("subscribe.html"))
    // ...
  } else {
    // User is signed out.
    // ...
    $("#auth-btn").text("Login").click(e => window.location.replace("login.html"))
    
  }
})

$('.alert button').click(function() { $(".alert").hide()})

const notice = new URLSearchParams(window.location.search).get('notice');
if(notice){
  toast(notice, 'alert-primary')
}

function toast(message, type = "alert-warning") {
  $('.alert p').text(message)
  $('.alert').removeClass('alert-primary alert-warning').addClass(type).show()
}

function loading(element){
  $(element).html("<img src='assets/loading-white.svg' width='30px'>");
}

function reload(message){
  var url = new URL(window.location.href);
  url.searchParams.set('notice', message);
  window.location.href = url.href;
}


