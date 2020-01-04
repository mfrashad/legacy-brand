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
        $("#updateDiv").show();
        setupUpdateButton();
        updateText(name);
      } else {
        console.log("subscription doesnt exist")
        $("#subscribeDiv").show();
        autofill(data)
        createCard(stripe);
      }
      finishLoad();
    })
    .catch(function(error){ finishLoad();toast(error.message) })
  } else {
    window.location.replace('login.html')
    finishLoad();
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

function createCard(stripe){
  $("#payment").show();
  // Create an instance of Elements.
  var elements = stripe.elements();

  // Custom styling can be passed to options when creating an Element.
  // (Note that this demo uses a wider set of styles than the guide below.)
  var style = {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  };
  var card = elements.create('card', {hidePostalCode: true, style: style});
  card.mount('#card-element');
  card.addEventListener('change', event => {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });

  // Handle form submission.
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if(!validateForm()) return;
    loading("#subscribeButton");
    const {name, address} = getFormValue();
    stripe.createToken(card, {
      name,
      address_line1: address.street,
      address_city: address.city,
      address_state: address.state,
      address_zip: address.zip,
    }).then(result => {
      if (result.error) {
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        stripeTokenHandler(result.token);
      }
    });
  });
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
      .then(result => redirect('dashboard.html', 'Subscription updated successfully'))
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
  $(`#select-package option[value=${quantity}]`).attr("selected", "selected");
  $(`#select-city option[value='${city}']`).attr("selected", "selected");
  $(`#select-pillar option[value='${pillar}']`).attr("selected", "selected");
  let x;
  if (products){
    for(x of products) {
      $(`#products input[value='${x}'`).prop("checked", true);
    }
  }
  $("input#fullName").val(name);
  $("input#phoneNumber").val(phone);
  if(address){
    $("input#addressStreet").val(address.street);
    $("input#addressCity").val(address.city);
    $("input#addressZip").val(address.zip);
    $("input#addressState").val(address.state);
  }
}

function updateText(name){
  $("#welcomeText").text(`${name}'s Dashboard`);
  $("#plan h5").text("My Subscription Plan");
  $("#products h5").text("My Choice of Products")
  $("#details h5").text("My Details");
  $("#city h5").text("Legacy Impact City and Pillar Choices")
}