AOS.init({duration: 500, delay: 300});

const LIVE_PK = "pk_live_3o8XcCuGk6ylw25DBUG0ha7N00KdFKhUTR";
const TEST_PK = "pk_test_vwY33uSQEAm18eCK6JoTvjKX00cFlWEqFZ";

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log('Signed in')
    $("#auth-btn").text("Log out").click(() => {
      firebase.auth().signOut()
      window.location.replace("login.html")
    })
    $("#home #subscribeButton").text("VIEW DASHBOARD").click(e => window.location.replace("dashboard.html"))
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

function finishLoad(){
  $('.preloader').fadeOut();
}

function toast(message, type = "alert-warning") {
  $('.alert p').text(message)
  $('.alert').removeClass('alert-primary alert-warning').addClass(type).show()
}

function loading(element){
  const text = $(element).text();
  $(element).html("<img src='assets/loading-white.svg' width='30px'>");
  return text;
}

function stopLoading(element, text){
  $(element).text(text);
}

function reload(message){
  redirect(window.location.pathname, message)
}

function redirect(dest, message){
  var url = new URL(window.location.origin +'/'+ dest);
  url.searchParams.set('notice', message);
  window.location.href = url.href;
}

function checkDate(){
  return (new Date(Date.now()).getDate() <= 28)
}


