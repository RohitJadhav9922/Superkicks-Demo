function StartTimer(){
  const _this = this;
  var Timer = document.querySelector(".special-timer");
  var startTime = Timer.getAttribute("data-startTime");
    
  var countDownDate = new Date(`${startTime}`).getTime();
  
  if(!isNaN(countDownDate)){
    // Update the count down every 1 second
    var Timer = setInterval(function() {
      // Get today's date and time
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
    
      // Display the result in the element with id="special-timer"
      document.querySelector(".special-timer").innerHTML ="LAUNCHES IN: "+ days + "d " + hours + "h "+ minutes + "m " + seconds + "s ";
      //Disable the button
      document.querySelector(".product-form__submit").style.pointerEvents = "none"; 
      document.querySelector(".product-form__submit").setAttribute("disabled",true);
  
      // If the count down is finished, write some text
      if (Time < 0) {
        clearInterval(Timer);
        document.querySelector(".special-timer").innerHTML =" ";
        document.querySelector(".product-form__submit").style.pointerEvents = "auto"; 
        document.querySelector(".product-form__submit").style.display = "block"; 
        document.querySelector(".product-form__submit").removeAttribute("disabled");
        // EndTimer();
      }
      
    }, 1000);
  }
}
StartTimer();



