// ---flickity for product image---//
// var elem = document.querySelector('.head-product_image__conatiner');
// setTimeout(()=>{
//   var flkty = new Flickity( elem, {
//     // options
//     cellAlign: 'left',
//     contain: true,
//     arrowShape: { 
//       x0: 10,
//       x1: 45, y1: 35,
//       x2: 50, y2: 30,
//       x3: 20
//     }
//   });
// },500)
  


//Raffle product get endtime
var raffle = document.querySelector(".variant-raffle");
var raffleid = raffle.getAttribute("data-raffle-id");
fetch("https://superkickraffletest.marmeto.com/getRaffle",{
    method: 'POST',
    headers:{'Content-Type': 'application/json'},
    body: JSON.stringify({"_id" : `${raffleid}`})
})
.then(async res => await res.json())
.then(async json => {
  console.log(json.raffleData.start_date);
  var Raffledata = await json.raffleData;
  var start = await Raffledata.start_date;
  var end = await Raffledata.end_date;
  var startTime = await new Date(`${start}`).getTime();
  var endTime = await new Date(`${end}`).getTime();
  
  var now = await new Date().getTime();
  sessionStorage.setItem("RaffleStartTime",start);
  sessionStorage.setItem("RaffleEndTime",end);
  
  // Find the Time between now and the count down date
  var Time = startTime - now;
  if(Time < 0)
  {
    EndTimer();
  }
  else{
    //calling the Timer Function
    StartTimer();
  }
})



function StartTimer(){
   var countDownDate = new Date(`${sessionStorage.getItem("RaffleStartTime")}`).getTime();
  // Get today's date and time

  // Update the count down every 1 second
  var Timer = setInterval(function() {
  
    var now = new Date().getTime();

    // Find the Time between now and the count down date
    var Time = countDownDate - now;
  
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(Time / (1000 * 60 * 60 * 24));
    var hours = Math.floor((Time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((Time % (1000 * 60 * 60)) / (1000 * 60));
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var seconds = Math.floor((Time % (1000 * 60)) / 1000);
    seconds = seconds < 10 ? "0" + seconds : seconds;
  
    // Display the result in the element with id="demo"
    document.querySelector(".timer").innerHTML ="Starts in: "+ days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";
    // console.log( days + "d " + hours + "h "
    // + minutes + "m " + seconds + "s ");

    document.querySelector(".enter-draw_button").setAttribute("disabled",true);
    // If the count down is finished, write some text
    if (Time < 0) {
      clearInterval(Timer);
      document.querySelector(".timer").innerHTML =" ";
      EndTimer();
    }
  }, 1000);
}



//---Raffle Timer---//
function EndTimer(){
  
  var countDownDate = new Date(`${sessionStorage.getItem("RaffleEndTime")}`).getTime();
  // Get today's date and time

  // Update the count down every 1 second
  var Timer = setInterval(function() {

    var now = new Date().getTime();

    // Find the Time between now and the count down date
    var Time = countDownDate - now  ;
  
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(Time / (1000 * 60 * 60 * 24));
    var hours = Math.floor((Time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((Time % (1000 * 60 * 60)) / (1000 * 60));
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var seconds = Math.floor((Time % (1000 * 60)) / 1000);
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Display the result in the element with id="demo"
    document.querySelector(".timer").innerHTML ="Ends in: "+ days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";
    document.querySelector(".enter-draw_button").removeAttribute("disabled");
    // If the count down is finished, write some text
    if (Time < 0) {
      clearInterval(Timer);
      document.querySelector(".timer").style.display = "block";
      document.querySelector(".timer").innerHTML = " ";
      // document.querySelector(".enter-draw_button").innerHTML = "Raffle closed";
      document.querySelector(".draw-entered_button").classList.add("custom-hide-button");
      document.querySelector(".enter-draw_button").classList.add("custom-hide-button");
      document.querySelector(".draw-ended_button").classList.remove("custom-hide-button");
      document.querySelector(".form-pop_container").style.display ="none";
      document.querySelector(".background-popup").style.display="none";
      document.querySelector(".enter-draw_button").setAttribute("disabled",true);
    }
  }, 1000);

}

/* form*/
let enterDrawBtn = document.querySelector(".enter-draw_button");
let popupContainer = document.querySelector(".form-pop_container");
// let loginForm = document.querySelector("");
let enterdrawForm = document.querySelector(".enter-draw_form");
let closeBtn = document.querySelectorAll(".form-pop_container .icon-close");

if(enterDrawBtn.id == "logged_in"){
  sessionStorage.setItem("user","logged_in");
}
else{
  sessionStorage.setItem("user","not-logged_in");
}

//if user click login we are setting a sessionStorage to show the popup
document.querySelector("#customer_login").addEventListener("submit",function(){
    sessionStorage.setItem("login-clicked",true);
});
if(sessionStorage.getItem("login-clicked") == "true"){
    popupContainer.classList.add("logged-in");
    popupContainer.style.display ="block";
    document.querySelector("body").classList.add("overflow-hidden");
    document.querySelector(".background-popup").style.display="block";
}
if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  sessionStorage.removeItem("login-clicked");
} 

enterDrawBtn.addEventListener("click",function(){
  if(enterDrawBtn.id == "logged_in" ){
    if(document.querySelector(".draw_form").style.display == "none"){
      document.querySelector(".register-message").style.display = "none";
      document.querySelector(".draw_form").style.display = "block"
    }
    popupContainer.classList.add("logged-in");
    popupContainer.style.display ="block";
    document.querySelector("body").classList.add("overflow-hidden");
    // for background blur
    document.querySelector(".background-popup").style.display="block";
  }
  else{
    popupContainer.classList.add("not_logged-in");
    popupContainer.style.display ="block";
    document.querySelector("body").classList.add("overflow-hidden");
    // for background blur
    document.querySelector(".background-popup").style.display="block";
  }
})

closeBtn.forEach(btn =>{
  btn.addEventListener("click",function(){
    popupContainer.style.display =" none";
    document.querySelector("body").classList.remove("overflow-hidden");
    // for background blur
    document.querySelector(".background-popup").style.display="none";
    sessionStorage.removeItem("login-clicked");
  });
});

//---Form Validation---//
//Function to allow only numbers
function _isNumberCheck(evt) {
var charCode = (evt.which) ? evt.which : event.keyCode
if (charCode > 31 && (charCode < 48 || charCode > 57))
  return false;
return true;
}



//Function to validate phone number
function _isNumberDigit($input){
var $countryInputValue = $('#shipping_address_country').val();

if ($countryInputValue == "India") {
  var $inputNumber = $input.val(),
      $trimNumber = $inputNumber.replace(/ /g, '');

  $input.val($trimNumber);

  if($input.val().length == 10){
    if ($trimNumber.match(/^[6-9]\d{9}$/)) {
      $('.phone-error').hide();
      var mobileNumber = $input.val();
      $input.val('+91' + mobileNumber);          
      return true;
    }
    else {
      $('#phone_number').addClass("field--error");
      $('.phone-error').show().text('Phone number should start with 6-9');
      if ($('#error-for-phone').length > 0 ){$('.phone-error').hide();}
      return false;
    }
  }
  else if($input.val().length == 13){
    var $mobileNumber = $input.val();
    var $countryCode = $mobileNumber.substring(0, 3);
    
    if($countryCode == '+91'){
      var $submittedNumber = $mobileNumber.replace('+91',''),
          $submittedTrimNumber = $submittedNumber.replace(/ /g, '');
      
      if ($submittedTrimNumber.match(/^[6-9]\d{9}$/)) {
        $('.phone-error').hide();         
        return true;
      }
      else {
        $('#phone_number').addClass("field--error");
        $('.phone-error').show().text('Phone number should start with 6-9 after the country code');
        if ($('#error-for-phone').length > 0 ){$('.phone-error').hide();}
        return false;
      }
    }
    else{
      $('#phone_number' ).addClass( "field--error" );
      $('.phone-error').show().text('Please enter a valid 10 digit phone number or +91 country code');
      if ($('#error-for-phone').length > 0 ){$('.phone-error').hide();}
      return false;
    }
  }
  else {
    $('#phone_number' ).addClass( "field--error" );
    $('.phone-error').show();
    if ($('#error-for-phone').length > 0 ){$('#phone_number').hide();}
    return false;
  }
} else {
  return true;
}
}

//Function to allow only number and length should not be more than 6
function _pincodeChecker(evt){
if (evt.which < 48 || evt.which > 57 || evt.target.value.length === 6) 
    return false;
return true;
}

//Function for pincodeValidate
function _pincodeValidate($pincodeInput){
  if ($pincodeInput.val().length  !== 6){
    $(".pincode").addClass("field--error"); 
    $('.pincode-error').show();
    if ($('#error-for-phone').length > 0 ){$('.pincode-error').hide();}
    return false;
  }
  else{
    return true;
  }
}


function _validate(){
  //Phone Field
  var $phoneInput = $('#phone_number'),
      $contactForm = $('.enter-draw_form > form');
  //pincode
  var pincodeInput = $(".pincode");
  
  let flag = false;
  _pincodeValidate(pincodeInput);
  _isNumberDigit($phoneInput);
  if(_pincodeValidate(pincodeInput) && _isNumberDigit($phoneInput)){
    flag= true;
    console.log("success");
    return true;
  }
  else{
    flag= false;
    return false;
  }
}

$(document).ready(function(){
//Append the message
$('.js-phone_number').append('<div><p class="phone-error">Please enter a valid 10 digit phone number</p></div>');
$(".js-pincode").append('<div><p class="pincode-error">Enter a valid 6 digit pincode</p></div>');

//Phone Field
var $phoneInput = $('#phone_number'),
    $contactForm = $('.enter-draw_form > form');

//pincode
var pincodeInput = $(".pincode");
pincodeInput.on('keypress', function(e) {
  return _pincodeChecker(e);
});

//On keypress allow only number 
$phoneInput.keypress(function(event) {
  return _isNumberCheck(event);
});

/*-------------------On form submit -------------------*/
$contactForm.on('submit', function(e){
  
  //---for otp---//

  e.preventDefault();
  if(_validate()){
    let verifiedAtt = document.querySelector(".draw_form").getAttribute("data-verified");
    if(verifiedAtt === "not-verified"){
      //show Otp
      opt();
      document.querySelector(".new-modal").style.display="block";
    }
    else{
      formdata();
    }
  }
});

//for opt close
$(".modal-close").on("click",function(){
  document.querySelector(".new-modal").style.display="none";
})

//Input on click remove error message for number
$phoneInput.on('click', function() {
  $('#phone_number').removeClass("field--error");
  $('.phone-error').hide();
});

//Input on click remove error message for pincode
pincodeInput.on('click', function() {
  $('.pincode').removeClass("field--error");
  $('.pincode-error').hide();
});
}); 

async function opt(){
  let customerId = document.querySelector("[name='shopifyCustomerId']").value;
  let phoneNumber = document.querySelector("#phone_number").value;
  let contactInput = document.querySelector("#contact_input");
  contactInput.value = phoneNumber;
  
  var contact_num = phoneNumber.replace(/ /g, '');
  if (contact_num.length > 10) {
    contact_num = contact_num.substr(contact_num.length - 10);
  }
  console.log(contact_num);


  // 10 minutes from now
  var time_in_minutes = 10;
  var current_time = Date.parse(new Date());
  var deadline = new Date(current_time + time_in_minutes*60*1000);
  
  
  function time_remaining(endtime){
  	var t = Date.parse(endtime) - Date.parse(new Date());
  	var seconds = Math.floor( (t/1000) % 60 );
  	var minutes = Math.floor( (t/1000/60) % 60 );
  	var hours = Math.floor( (t/(1000*60*60)) % 24 );
  	var days = Math.floor( t/(1000*60*60*24) );
  	return {'total':t, 'days':days, 'hours':hours, 'minutes':minutes, 'seconds':seconds};
  }
  function run_clock(id,endtime){
  	
  	function update_clock(){
  		var t = time_remaining(endtime);
        let resendBtn = document.querySelector(".resend-text");
        resendBtn.setAttribute("disabled",true);
        document.querySelector(".mm-wrapper .count").textContent = t.minutes +":"+t.seconds;
  		
  		if(t.total<=0){
          clearInterval(timeinterval); 
          resendBtn.removeAttribute("disabled");
        }
  	}
  	update_clock(); // run function once at first to avoid delay
  	var timeinterval = setInterval(update_clock,1000);
  }
  run_clock('clockdiv',deadline);

   let sendOtp = await fetch("https://superkickraffletest.marmeto.com/sendOtp",{
          method: 'POST',
          headers:{
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "phone": `${contact_num}`,
            "customerId":`${customerId}`
          })
      });
  let sendOtpResult = await sendOtp.json();
  console.log(sendOtpResult)
  //uniqueId
  var uniqueId = sendOtpResult.uniqueId;
  console.log(sendOtpResult.uniqueId);
  
  //resendBtn
  let resendBtn = document.querySelector("#resend__otp");
  resendBtn.addEventListener("click",async function(){
    let sendOtp = await fetch("https://superkickraffletest.marmeto.com/sendOtp",{
          method: 'POST',
          headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "phone": `${contact_num}`,
              "customerId":`${customerId}`
            })
        });
    let sendOtpResult = await sendOtp.json();
    console.log(sendOtpResult)
  })
  

  let completeOrder = document.querySelector("#verify_otp");
  completeOrder.addEventListener("click",async function(){
    var otp = document.querySelector("#otp_input");
    var Message = document.querySelector(".otp-message");
    var otpCode = otp.value;
    if(otpCode.length != 0){
      
      let verifyOtp = await fetch("https://superkickraffletest.marmeto.com/verifyOtp",{
        method: 'POST',
        headers:{
          'content-Type': 'application/json'
        },
        body: JSON.stringify({
          "uniqueId" : `${uniqueId}`,
          "otp" : `${otpCode}` ,
          "customerId" :`${customerId}`
        })
      })
      let verifyResponse = await verifyOtp.json();
      console.log(verifyResponse);
      if(verifyResponse.message =="Incorrect OTP!" || verifyResponse.message == "Incorrect Unique Id!"){
        Message.style.display ="inline-block";
        Message.textContent = "Incorrect Otp";
      }
      else{
        Message.style.display ="inline-block";
        Message.classList.add("verified");
        Message.textContent = "verified";
        var verified = document.querySelector(".draw_form");
        verified.setAttribute("data-verified","verified")
        console.log("verified");
        
        setTimeout(function(){
          document.querySelector("#otpModal").style.display ="none";
          document.querySelector(".form-pop_container").style.display = "none";
          formdata();
        },2000)
        
      } 
    }
    else{
     Message.style.display ="inline-block";
     console.log("failed");
     Message.textContent = "Enter the Otp";
    }
  })
}


function formdata(){
  let firstName = document.querySelector("input[name=firstname]").value;
  let lastName = document.querySelector("input[name=lastname]").value;
  let address= document.querySelector("input[name=address]").value;
  let pincode = document.querySelector("input[name=pincode]").value;
  let country = document.querySelector("select[name=country]").value;
  let state = document.querySelector("select[name=state]").value;
  let city = document.querySelector("input[name=city]").value;
  let phoneNumber = document.querySelector("input[name=phone-number]").value;
  let email = document.querySelector("input[name=email-id]").value;
  let customerId = document.querySelector("input[name=shopifyCustomerId]").value;
  let variantId = document.querySelector("input[name=variantId]").value;;
  let raffle_id = document.querySelector("input[name=raffleId]").value;
  let productName = document.querySelector("input[name=productName]").value;
  let productImage = document.querySelector("input[name=productImageUrl]").value;
  let productImageUrl = productImage.slice(2);

  let size = document.querySelectorAll('[name="Shoe Size (UK)"]') || document.querySelectorAll('[name="Size"]');
  let sizeValue = "";
  size.forEach(size =>{
    if(size.checked){
        sizeValue = size.value;
    }  
  });
  // passing the data to the backend 
  var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      var raw = JSON.stringify({
        "raffle_id": raffle_id,
        "shopifyCustomerId": customerId,
        "firstName": firstName,
        "lastName": lastName,
        "address": address,
        "city": city,
        "state": state,
        "pincode": pincode,
        "country": country,
        "email": email,
        "phone": phoneNumber,
        "variant_id": variantId,
        "product_name": productName,
        "product_url": productImageUrl,
        "product_size": sizeValue

      });
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
      fetch("https://superkickraffletest.marmeto.com/raffleEntry", requestOptions)
        .then(result =>{
           console.log(result);
           return result.json();
        })
        .then(data =>{
          console.log(data);
          var registerMessage = document.querySelector(".register-message");
          let popupContainer = document.querySelector(".form-pop_container");
          let backgroundPopup = document.querySelector(".background-popup");
          if(data.msg == "Email is already registered for the raffle !"){
            document.querySelector(".draw_form").style.display = "none";
            popupContainer.style.display = "none";

            if(registerMessage.style.display == "none"){
                registerMessage.style.display = "block";
                registerMessage.classList.remove("success");
                registerMessage.classList.add("error");
                registerMessage.textContent = "Email is already registered for the raffle !";
                backgroundPopup.style.display = "block";
            }

            setTimeout(function(){
              backgroundPopup.style.display = "none";
              document.querySelector("body").classList.remove("overflow-hidden");
              registerMessage.style.display = "none";
            },2000);
            // document.querySelector(".enter-draw_button").innerHTML = "Raffle entered";
            document.querySelector(".draw-entered_button").classList.remove("custom-hide-button");
            document.querySelector(".enter-draw_button").classList.add("custom-hide-button");
            document.querySelector(".draw-ended_button").classList.add("custom-hide-button");
            document.querySelector(".enter-draw_button").setAttribute("disabled",true);
          }
          else{
            // document.querySelector(".center").style.display = "none";
            document.querySelector(".draw_form").style.display ="none";
            popupContainer.style.display = "none";
            
            if(registerMessage.style.display == "none"){
              registerMessage.style.display = "block";
              registerMessage.classList.add("success");
              registerMessage.textContent = "Successfully registered";
              backgroundPopup.style.display = "block";
            }
            
            setTimeout(function(){
              backgroundPopup.style.display = "none";
              document.querySelector("body").classList.remove("overflow-hidden");
              registerMessage.style.display = "none";
            },2000);
            // document.querySelector(".enter-draw_button").innerHTML = "Raffle entered";
            document.querySelector(".draw-entered_button").classList.remove("custom-hide-button");
            document.querySelector(".enter-draw_button").classList.add("custom-hide-button");
            document.querySelector(".draw-ended_button").classList.add("custom-hide-button");
            document.querySelector(".enter-draw_button").setAttribute("disabled",true);
          }
        })
        .catch(error => console.log('error', error))
        
}

//---Size chart---//
let sizeChartBtn = document.querySelector(".size-chart");
if(sizeChartBtn){
  let sizeChartContainer = document.querySelector(".size-chart_container");
  let sizeChartCloseBtn = document.querySelector(".size-chart_container .icon-close");
  sizeChartBtn.addEventListener("click",function(){
    sizeChartContainer.style.display = "block";
    document.querySelector("body").classList.add("overflow-hidden");
  })
  sizeChartCloseBtn.addEventListener("click",function(){
    sizeChartContainer.style.display = "none";
    document.querySelector("body").classList.remove("overflow-hidden");
  })
}