// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
const db = firebase.firestore()

$('#products input[type="checkbox"]').on('click', function(e) {
  if($('#products input[type="checkbox"]:checked').length > parseInt($("#select-package option:selected").val())) {
    $(this).prop('checked', false);
  }
});

$("#select-package").on('change', function(e){
  $('#products input[type="checkbox"]').prop('checked', false);
})


const stripe = Stripe('pk_test_vwY33uSQEAm18eCK6JoTvjKX00cFlWEqFZ');

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log(user.uid);
    const ref = db.collection("stripe_customers").doc(user.uid)
    ref.get().then(function(doc){
      const data = doc.data();
      const { subscription, name } = data;
      if(subscription) {        
        autofill(data);
        $("input#email").val(user.email)
        $("#updateDiv").show();
        setupUpdateButton();
        setupCancelButton();
        fillCard();
        updateText(name);
      } else {
        console.log("subscription doesnt exist")
        window.location.replace('subscribe.html')
      }
    })
    .catch(function(error){ toast(error.message) })
  } else {
    window.location.replace('login.html')
  }
});

function validateForm(){
  const checked = $('#products input[type="checkbox"]:checked').length;
  const quantity = parseInt($("#select-package option:selected").val())
  if( checked !== quantity ) {
    toast(`Please select ${quantity} products for this package, or change to another package.`);
    return false;
  }
  return true;
}

function fillCard(){
  const getCard = firebase.functions().httpsCallable('getCard');
  getCard()
  .then(card => {
    const { last4, exp_month, exp_year, name} = card;
    $("#payment .number").text(`xxxx-xxxx-xxxx-${last4}`);
    $("#payment .card-expiration-date").text(`${exp_month}/${exp_year.substring(2,4)}`)
    $("#payment .card-holder").text(name);
  })
  .catch(error => toast(error.message));
}

function setupUpdateButton(){
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if(!validateForm()) return;
    loading("#updateButton");
    const updateSubscription = firebase.functions().httpsCallable('updateSubscription');
    const data = getFormValue();
    updateSubscription(data)
      .then(result => reload('Subscription updated successfully'))
      .catch(error => toast(error.message));
  });
}

function setupCancelButton() {
  var button = document.getElementById('cancelButton');
  button.addEventListener('click', async event => {
    event.preventDefault();
    loading("#cancelButton");
    const cancelSubscription = firebase.functions().httpsCallable('cancelSubscription');
    cancelSubscription()
      .then(result => reload('Subscription cancelled successfullly'))
      .catch(error => toast(error.message));
  });
}

// Save token to firestore
function stripeTokenHandler(token) {
  const user = firebase.auth().currentUser;
  const userRef = db.collection("stripe_customers").doc(user.uid)
  userRef.collection("tokens").add({token: token.id})
    .then(() => {
      const subscribe = firebase.functions().httpsCallable('subscribe');
      const data = getFormValue();
      subscribe({token: token.id, ...data})
        .then(result => location.replace('thankyou.html'))
        .catch(error => toast(error.message));
    })
}

function getFormValue() {
  const quantity = parseInt($("#select-package option:selected").val());
  const products = $("#products input:checked").map(function() {return $(this).attr('value')}).get();
  const city = $("#select-city option:selected").val()
  const pillar = $("#select-pillar option:selected").val()
  const name = $("input#fullName").val()
  //const email = $("input#email").val()
  const phone = $("input#phoneNumber").val()
  const address = {
    street: $("input#addressStreet").val(),
    city: $("input#addressCity").val(),
    zip: $("input#addressZip").val(),
    state: $("input#addressState").val(),
  }

  return { quantity, products, city, pillar, name, phone, address };
}

function autofill(data) {
  const { quantity, products, city, pillar, name, phone, address } = data;
  $("input#package").val(`$${quantity - 1}9.99 - ${quantity} Products`);
  $("input#legacyCity").val(city);
  $("input#pillar").val(pillar);
  let x;
  for(x of products) {
    $(`ul[title='${x}']`).show();
  }
  $("input#fullName").val(name);
  $("input#phoneNumber").val(phone);
  $("input#addressStreet").val(address.street);
  $("input#addressCity").val(address.city);
  $("input#addressZip").val(address.zip);
  $("input#addressState").val(address.state);
}

function updateText(name){
  $("#welcomeText").text(`${name}'s Dashboard`);
  $("#plan h5").text("My Subscription Plan");
  $("#products h5").text("My Choice of Products")
  $("#details h5").text("My Details");
  $("#city h5").text("Legacy Impact City and Pillar Choices")
}