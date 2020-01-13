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

if(!checkDate()){
  $("#updateButton").prop("disabled", true);
}

const stripe = Stripe(TEST_PK);



function fillInfo(user, data){
  const { subscription, name } = data;
  if(subscription) {        
    autofill(data);
    $("input#email").val(user.email)
    $("#updateDiv").show();
    setupCancelButton();
    fillCard();
    getInvoices();
    updateText(name);
  } else {
    console.log("subscription doesnt exist")
    window.location.replace('subscribe.html')
  }
}

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    console.log(user.uid);
    const ref = db.collection("stripe_customers").doc(user.uid);
    const doc = await ref.get();
    if(doc.exists) {
      fillInfo(user, doc.data());
    } else {
      const createCustomer = firebase.functions().httpsCallable('createCustomer');
      const customer = await createCustomer();
      console.log(customer)
      reload();
    }
  } else {
    window.location.replace('login.html');
  }
  finishLoad();
});

function setupCancelButton() {
  var button = document.getElementById('cancelButton');
  button.addEventListener('click', async event => {
    event.preventDefault();
    if(!confirm("Are you sure you want to cancel the subscription? There is no refund!")) return;
    const text = loading("#cancelButton");
    const cancelSubscription = firebase.functions().httpsCallable('cancelSubscription');
    cancelSubscription()
      .then(result => reload('Subscription cancelled successfullly'))
      .catch(error => {
        stopLoading("#cancelButton", text);
        toast(error.message);
      });
  });
}

function fillCard(){
  const getCard = firebase.functions().httpsCallable('getCard');
  getCard()
  .then(card => {
    const { last4, exp_month, exp_year, name} = card.data;
    $("#cardNumber").text(`XXXX XXXX XXXX ${last4}`);
    $("#cardExp").text(`${exp_month < 10 ?"0" + exp_month : exp_month}/${exp_year.toString().substring(2,4)}`)
    $("#cardName").text(name);
  })
  .catch(error => toast(error.message));
}

function getInvoices(){
  const getInvoices = firebase.functions().httpsCallable('getInvoices');
  getInvoices()
   .then(invoices => {
     fillInvoices(invoices.data.data);
   })
   .catch(error => toast(error.message));
}

function autofill(data) {
  const { quantity, products, city, pillar, name, phone, address, shippingAddress } = data;
  $("input#package").val(`$${quantity - 1}9.99 - ${quantity} Products`);
  $("input#legacyCity").val(city);
  $("input#pillar").val(pillar);
  let x;
  for(x of products) {
    $(`ul[title='${x}']`).show();
  }
  $("input#fullName").val(name);
  $("input#phoneNumber").val(phone);

  if(address){
    $("input#addressStreet").val(address.street);
    $("input#addressCity").val(address.city);
    $("input#addressZip").val(address.zip);
    $("input#addressState").val(address.state);
  }
  if(shippingAddress){
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

function fillInvoices(invoices){
  let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let total_contribution = 0;
  let total_paid = 0;
  for (i of invoices) {
    const d = new Date(i.created * 1000);
    const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const total = i.total / 100;
    const contribution = total * 0.15;
    total_paid = total_paid + total;
    const sign = total > 0 ? "" : "-";
    console.log(total_paid);
    const { city, pillar } = i.metadata;
    $("tbody").append(`
      <tr>
        <td scope="row">${date}</td>
        <td class="${total > 0 ? "text-success" : "text-danger"}">${total > 0 ? "PAID" : "REFUNDED"}</td>
        <td>${sign}$${Math.abs(total)}</td>
        <td>${sign}$${Math.abs(contribution).toFixed(2)}</td>
        <td>${city}</td>
        <td>${pillar}</td>
        ${i.hosted_invoice_url ? `<td><a href="${i.hosted_invoice_url}" target="_blank">View</a></td>` : '<td>-</td>'}
        ${i.invoice_pdf ? `<td><a href="${i.invoice_pdf}" target="_blank">Download</a></td>` : '<td>-</td>'}
      </tr>
    `)
  }
  total_contribution = total_paid * 0.15;
  if(total_contribution > 0) initChart(total_paid, total_contribution);
  $("#contribution").text(`Total Contributed: $${total_contribution.toFixed(2)}`)
}

function initChart(total, contribution){
  console.log(contribution)
  var ctx = document.getElementById("myChart").getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: ["Total Paid",	"Total Contribution"],
          datasets: [{    
              data: [total, contribution.toFixed(2)], // Specify the data values array
              backgroundColor: ['#BAD85F', '#31A95D'], // Add custom color background (Points and Fill)
          }]},         
      options: {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
      }
  });
}