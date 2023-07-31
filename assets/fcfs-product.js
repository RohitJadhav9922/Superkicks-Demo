customElements.define(
  "product-form-fcfs",
  class ProductFormFcfs extends HTMLElement {
    constructor() {
      super();
      this.form = this.querySelector("form");
      this.form.querySelector("[name=id]").disabled = false;

      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.reCaptcha(event);
      });

      this.cart =
        document.querySelector("cart-notification") ||
        document.querySelector("cart-drawer");
      this.submitButton = this.querySelector('[type="submit"]');

      if (document.querySelector("cart-drawer")) {
        this.submitButton.setAttribute("aria-haspopup", "dialog");
      }
  
      this.Timer();
  
    }

    // Function to disable submit button, add loading class and show loading overlay
    disableSubmitButton() {
      this.submitButton.setAttribute("disabled", true);
      document.querySelector(".product-form__submit span").textContent = "added to cart";
      this.submitButton.classList.add("loading");
      this.querySelector(".loading-overlay__spinner").classList.remove("hidden");
      this.submitButton.setAttribute("aria-disabled", true);
    }
    enableSubmitButton() {
      this.submitButton.removeAttribute("aria-disabled");
      this.submitButton.classList.remove("loading");
      this.submitButton.removeAttribute("disabled");
      this.querySelector(".loading-overlay__spinner").classList.add("hidden");
      document.querySelector(".product-form__submit span").textContent = "Add to cart";
    }
    Timer() {
      const _this = this;
      var Timer = document.querySelector(".fcfs-timer");
      var startTime = Timer.getAttribute("data-startTime");
      var countDownDate = new Date(`${startTime}`).getTime();
      let saleText = "LAUNCHES IN: ";
      const element = document.querySelector(".product-form__submit");
      const now = new Date().getTime();
      let upcomingFCFS = countDownDate - now > 0;

      if (!upcomingFCFS) {
        element.classList.remove("upcoming");
      }

      if (localStorage.getItem("EndTimeCheckout") && !element.classList.contains("upcoming")) {
        saleText = "YOUR TIME LEFT: ";
      }

      // Update the count down every 1 second
      var Timer = setInterval(function () {
        // Get today's date and time
        var now = new Date().getTime();
        if (element.classList.contains("upcoming")) {
          var countDownTill = countDownDate;
        } else {
          var countDownTill = parseInt(localStorage.getItem("EndTimeCheckout"));
        }
        // Find the Time between now and the count down date
        var Time = countDownTill - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(Time / (1000 * 60 * 60 * 24));
        var hours = Math.floor((Time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((Time % (1000 * 60 * 60)) / (1000 * 60));
        minutes = minutes < 10 ? "0" + minutes : minutes;
        var seconds = Math.floor((Time % (1000 * 60)) / 1000);
        seconds = seconds < 10 ? "0" + seconds : seconds;

        // Display the result in the element with id="fcfs-timer"
        document.querySelector(".fcfs-timer").innerHTML =
          saleText + days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
        //Disable the button
        document.querySelector(".product-form__submit").setAttribute("disabled", true);
        document.querySelector(".product-form__submit").style.pointerEvents = "none";
        if (!element.classList.contains("upcoming")) {
          document.querySelector(".product-form__submit span").textContent = "Added to cart";
        } else {
          document.querySelector(".product-form__submit span").textContent = "Add to cart";
        }

        //hide the captcha
        document.querySelector(".g-recaptcha").style.display = "none";

        // If the count down is finished, write some text
        if (!Time || Time < 0) {
          clearInterval(Timer);
          localStorage.removeItem("endTime");
          document.querySelector(".fcfs-timer").innerHTML = " ";
          document.querySelector(".g-recaptcha").style.display = "block";
          document.querySelector(".product-form__submit").removeAttribute("disabled");
          document.querySelector(".product-form__submit").style.pointerEvents = "auto";
          document.querySelector(".product-form__submit span").textContent = "Add to cart";

          // Removing fcfs product when its out of time
          document.querySelectorAll("cart-remove-button").forEach((elem) => {
            if (elem.querySelector("[data-fcfs]")) elem.click();
          });

          grecaptcha?.reset();
        }
      }, 1000);
    }
    
    async reCaptcha(evt) {
      const event = evt;
      const _this = this;
      evt.preventDefault();

      this.disableSubmitButton();
      let productId = document.querySelector('[name="productId"]').value;
      let variantId = document.querySelector('[name="id"]').value;
      const apiUrl = "https://fcfs-stage.marmeto.com/api/verify-and-check";

      var response = await grecaptcha.getResponse();
      var onloadCallback = function () {
        grecaptcha.render("response", {
          sitekey: "6LdqtQYmAAAAAKURuAHsMHLEJW7UVU4WDYiLT93m",
          callback: verifyCallback,
          theme: "dark",
        });
      };
      var captchaMessage = document.querySelector(".recaptcha p");

      if (response.length == 0) {
        //reCaptcha not verified
        captchaMessage.style.display = "block";
        this.enableSubmitButton();
        return false;
      }

      const requestBody = {
        "g-recaptcha-response": response,
        variant_id: variantId,
        product_id: productId,
      };

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.code === 200) {
            _this.token = data.token;
            _this.holdInventory(event);
          } else if (data.code === 422) {
            document.querySelector(".recaptcha p").textContent = "Ohh Ho, Captcha Verification Failed :( Please try again!";
            captchaMessage.style.display = "block";
            this.enableSubmitButton();
            grecaptcha?.reset();
          } else if (data.code === 500) {
            document.querySelector(".recaptcha p").textContent = "There seems to be some problem with our servers. You can retry after a few seconds or reach out to admin for assistance.";
            grecaptcha?.reset();
          } else {
            let message = document.querySelector(".out-stock_message");
            message.textContent = "Quantity reserved in someone else cart please try after sometime!";
            this.disableSubmitButton();
            grecaptcha?.reset();
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

    async holdInventory(event) {
      event.preventDefault();
      const _this = this;
      let message = document.querySelector(".out-stock_message");
      const holdApiUrl = "https://fcfs-stage.marmeto.com/api/hold";

      message.style.display = "none";

      const dataBody = {
        token: this.token,
      };

      fetch(holdApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataBody),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code === 200) {
            this.disableSubmitButton();
            localStorage.setItem("EndTimeCheckout", data.time);
            _this.addtoCart();
          } else if (data.code === 406) {
            message.style.display = "block";
            message.textContent = "Quantity reserved in someone else cart please try after sometime!";
            this.enableSubmitButton();
            grecaptcha?.reset();
          } else {
            event.preventDefault();
            message.style.display = "block";
            message.textContent = "Out Of stock...!";
            this.enableSubmitButton();
          }
        })
        .catch((error) => {
          console.error("HTTP Error:", error);
          // Handle the HTTP error here
        });
    }

    addtoCart() {
      this.handleErrorMessage();
      const _this = this;
      const config = fetchConfig("javascript");
      config.headers["X-Requested-With"] = "XMLHttpRequest";
      delete config.headers["Content-Type"];

      const formData = new FormData(_this.form);
      if (_this.cart) {
        formData.append(
          "sections",
          _this.cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append("sections_url", window.location.pathname);
        _this.cart.setActiveElement(document.activeElement);
        formData.append("[properties][fcfs-added]", true);
        formData.append("[properties][dataToken]", this.token);
        formData.append("[properties][fcfs]", true);
      }

      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            _this.handleErrorMessage(response.description);
            const soldOutMessage =
              _this.submitButton.querySelector(".sold-out-message");
            if (!soldOutMessage) return;
            _this.submitButton.setAttribute("aria-disabled", true);
            _this.submitButton.querySelector("span").classList.add("hidden");
            soldOutMessage.classList.remove("hidden");
            _this.error = true;
            return;
          } else if (!_this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          _this.error = false;
          const quickAddModal = _this.closest("quick-add-modal");

          if (quickAddModal) {
            document.body.addEventListener(
              "modalClosed",
              () => {
                setTimeout(() => {
                  _this.cart.renderContents(response);
                });
              },
              { once: true }
            );
            quickAddModal.hide(true);
          } else {
            _this.cart.renderContents(response);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          _this.submitButton.classList.remove("loading");

      
          this.Timer();

          if (_this.cart && _this.cart.classList.contains("is-empty")) {
            _this.cart.classList.remove("is-empty");
          }

          if (!_this.error) {
            _this.submitButton.removeAttribute("aria-disabled");
            _this
              .querySelector(".loading-overlay__spinner")
              .classList.add("hidden");
          }

          //out of message
          let message = document.querySelector(".out-stock_message");
          message.style.display = "none";

          //hide the captcha
          document.querySelector(".recaptcha").style.display = "none";

          //Disable add to cart if product is added to the cart
          if (sessionStorage.getItem("Added") == "true") {
            document.querySelector(".product-form__submit").setAttribute("disabled", true);

            if (document.querySelector(".product-form__submit span")) {
              document.querySelector(".product-form__submit span").textContent = "Added to the cart";
            }
          } else {
            document.querySelector(".product-form__submit").removeAttribute("disabled");

            if (document.querySelector(".product-form__submit span")) {
              document.querySelector(".product-form__submit span").textContent = "Add to cart";
            }
          }

          var currentTime = new Date();
          var newstartTime = currentTime.setMinutes(
            currentTime.getMinutes() + 5
          );
          const deadline = new Date(newstartTime).getTime();
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper =
        this.errorMessageWrapper ||
        this.querySelector(".product-form__error-message-wrapper");

      if (!this.errorMessageWrapper) return;
      this.errorMessage =
        this.errorMessage ||
        this.errorMessageWrapper.querySelector(".product-form__error-message");

      this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  }
);






  
