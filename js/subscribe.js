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


// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = Stripe('pk_test_vwY33uSQEAm18eCK6JoTvjKX00cFlWEqFZ');
// Create a Stripe client.

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

// Create an instance of the card Element.
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission.
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error.
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server.
      stripeTokenHandler(result.token);
    }
  });
});

// Submit the form with the token ID.
function stripeTokenHandler(token) {
  // Insert the token ID into the form so it gets submitted to the server
  var form = document.getElementById('payment-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

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

  const user = firebase.auth().currentUser;

  const userRef = db.collection("stripe_customers").doc(user.uid)
  userRef.collection("tokens").add({token: token.id})
    .then(() => {
      const subscribe = firebase.functions().httpsCallable('subscribe');
      subscribe({
        token: token.id,
        quantity,
        products,
        city,
        pillar,
        address
      }).then(function(result) {
        // Redirect if success
        window.location.replace('thankyou.html')
      }).catch(function(error) {
        // Show error
        var code = error.code;
        var message = error.message;
        var details = error.details;
        console.log(errorMessage)
        $('.alert p').text(errorMessage)
        $('.alert').show()
      });
    })
  // const user = firebase.auth().currentUser;
  // // Submit the form
  // //form.submit();
  // const userRef = db.collection("stripe_customers").doc(user.uid)
  // userRef.collection("tokens").add({token: token.id})
  //   .then(() => userRef.collection("subscriptions").add({quantity: 3}))
  
  
}