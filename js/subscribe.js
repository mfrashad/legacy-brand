// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = Stripe('pk_test_vwY33uSQEAm18eCK6JoTvjKX00cFlWEqFZ');
// Create a Stripe client.

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log(user.uid);
    const ref = db.collection("stripe_customers").doc(user.uid)
    ref.get().then(function(doc){
      const data = doc.data();
      const {quantity, products, city, pillar, address, subscription} = data;
      if(subscription) {        
        autofill(quantity, products, city, pillar, address, subscription);
        $("#updateDiv").show();
        setupUpdateButton();
        setupCancelButton();

      } else {
        console.log("subscription doesnt exist")
        $("#subscribeDiv").show();
        createCard(stripe);
      }
    })
    .catch(function(error){ toast(error.message) })
  } else {
    window.location.replace('login.html')
  }
});

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
  var card = elements.create('card', {style: style});
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
    stripe.createToken(card).then(result => {
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
    const updateSubscription = firebase.functions().httpsCallable('updateSubscription');
    const { quantity, products, city, pillar, address } = getFormValue();
    updateSubscription({quantity,products,city,pillar,address})
      .then(result => location.reload())
      .catch(error => toast(error.message));
  });
}

function setupCancelButton() {
  var button = document.getElementById('cancelButton');
  button.addEventListener('click', async event => {
    event.preventDefault();
    const cancelSubscription = firebase.functions().httpsCallable('cancelSubscription');
    cancelSubscription()
      .then(result => location.reload())
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
      const { quantity, products, city, pillar, address } = getFormValue();
      subscribe({token: token.id,quantity,products,city,pillar,address})
        .then(result => location.replace('thankyou.html'))
        .catch(error => toast(error.message));
    })
}

function getFormValue() {
  const quantity = parseInt($("#select-package option:selected").val());
  const products = $("#products input:checked").map(function() {return $(this).attr('value')}).get();
  const city = $("#select-city option:selected").val()
  const pillar = $("#select-pillar option:selected").val()
  const address = {
    street: $("input#addressStreet").val(),
    city: $("input#addressCity").val(),
    zip: $("input#addressZip").val(),
    state: $("input#addressState").val(),
  }

  return { quantity, products, city, pillar, address };
}

function autofill(quantity, products, city, pillar, address) {
  $(`#select-package option[value=${quantity}]`).attr("selected", "selected");
  $(`#select-city option[value='${city}']`).attr("selected", "selected");
  $(`#select-pillar option[value='${pillar}']`).attr("selected", "selected");
  let x;
  for(x of products) {
    $(`#products input[value='${x}'`).prop("checked", true);
  }
  $("input#addressStreet").val(address.street);
  $("input#addressCity").val(address.city);
  $("input#addressZip").val(address.zip);
  $("input#addressState").val(address.state);
}