$('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
   let text = $('h1').text();
   $('h1').text(text === "Login" ? "Register" : "Login");
});