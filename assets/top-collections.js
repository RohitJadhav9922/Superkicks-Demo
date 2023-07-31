setTimeout(() => {
  var container = document.querySelectorAll(".js-product-grid");
  if (container) {
    // var productListLength = container.querySelectorAll(".product__list").length;
    if (window.innerWidth > 769) {
      container.forEach((ele) => {
        var flkty = new Flickity(ele, {
          // options
          cellAlign: "left",
          contain: true,
          adaptiveHeight: true,
          wrapAround: true,
          arrowShape: {
            x0: 10,
            x1: 40,
            y1: 30,
            x2: 45,
            y2: 25,
            x3: 20,
          },
          pageDots: false,
        });
      });
    } else {
      container.forEach((ele) => {
        ele.classList.add("mobile-flex_scroll");
      });
    }
  }
}, 500);
